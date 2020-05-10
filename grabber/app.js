const Database = require('../common/database');
const log = require('../common/log');
const {start} = require('./index');
const path = require('path');
const config = require('../common/config.json');

const db = new Database(
	path.isAbsolute(config.database.location)
		? config.database.location
		: path.resolve('..', config.database.location));

db.open();

const stop = start(db);

process.on('exit', () => {
	log('process exited');
	stop();
	db.close();
	log('database closed');
});

process.on('SIGUSR1', () => db.backup());
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));