const Database = require('../../common/database');
const log = require('../../common/log');
const {start} = require('./index');

const db = new Database('../database.db');
db.open();

start(db);

process.on('exit', () => {
	log('process exited');
	db.close();
	log('database closed');
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
