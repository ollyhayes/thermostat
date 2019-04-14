const Database = require("../../common/database");
const {start} = require("./index");

const db = new Database("../database.db");
db.open();

start(db);