const Database = require("../common/database");
const process = require("process");	
const log = require("../common/log");
const {start} = require("./index");

const database = new Database("../database.db");
database.open();

const end = start(database);

process.on("exit", () => {
	log("process exited - unsubscribing");
	end();
	database.close();
	log("database closed");
});

process.on("SIGINT", () => process.exit(0));