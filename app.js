const thermometer = require('./thermometer-reader/index');
const webInterface = require('./web-interface/private/index');
const Database = require('./common/database');
const log = require('./common/log');

const db = new Database('./database.db');
db.open();

const {stopThermometer, newDataEmitter} = thermometer.start(db);
webInterface.start(db, newDataEmitter);

process.on('exit', () => {
	log('process exited');
	stopThermometer();
	db.close();
	log('database closed');
});

process.on('SIGUSR1', () => db.backup());
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
