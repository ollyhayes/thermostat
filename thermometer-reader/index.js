const Database = require("../common/database");
const getTemperature = require("./thermometer");
const process = require("process");	
const log = require("../common/log");
const readline = require("readline");
const looper = require("./timeout-looper");

async function run()
{
	const database = new Database();
	await database.open();

	const subscription = looper(1000, () => getTemperature())
		.distinctUntilChanged()
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
			await database.close()
				.catch(error => log(error));
			log("database closed");
			process.exit();
		}
	});
}

run().catch(error => log(error));
