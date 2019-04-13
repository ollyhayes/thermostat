const Database = require("../common/database");
const getTemperature = require("./thermometer");
const process = require("process");	
const log = require("../common/log");
const readline = require("readline");
const looper = require("./timeout-looper");

function run()
{
	const database = new Database();
	database.open();

	const subscription = looper(1000, () => getTemperature())
		.distinctUntilChanged()
		.subscribe(
			temperature => database.insert(temperature),
			error => log("temperature error: " + error));

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on("line", line =>
	{
		if (line === "exit")
		{
			log("process exited - unsubscribing");
			subscription.unsubscribe();
			database.close()
			log("database closed");
			process.exit();
		}
	});
}

run();