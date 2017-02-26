const Database = require("./database");
const getTemperature = require("./thermometer");
const process = require("process");	
const log = require("./log");
const Rx = require("rxjs");
const readline = require("readline");

async function run()
{
	const database = new Database();
	await database.open();

	const subscription = getTemperature()
		.subscribe(
			temperature => database.insert(temperature),
			error => log("temperature error: " + error));

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on("line", async line =>
	{
		if (line === "exit")
		{
			log("process exited - unsubscribing");
			subscription.unsubscribe();
			log("closing database");
			await database.close()
				.catch(error => log(error));
			log("database closed");
			process.exit();
		}
	});
}

run().catch(error => log(error));
