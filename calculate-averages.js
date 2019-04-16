const Database = require("./common/database");
const log = require("./common/log");

async function run()
{
	const database = new Database();
	await database.calculatePrecisions(
		new Date(2017, 6, 1),
		new Date(2017, 6, 1, 1),
		10);

	log("finished!");
}

run().catch(error => log(error));