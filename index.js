const Database = require("./database");
const getTemperature = require("./thermometer");
const process = require("process");	
const log = require("./log");
const Rx = require("rxjs");
const readline = require("readline");

let subscription;

const database = new Database();
database
	.open()
	.then(() => 
	{
		subscription = getTemperature()
			.subscribe(
				temperature => database
					.insert(temperature)
					.catch(error => log("db error: " + error)),
				error => log("temperature error: " + error));
	})
	.catch(error => console.log("database error: ", error));

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
		log("closing database");
		database.close()
			.then(() =>
			{
				log("database closed");
				process.exit();
			})
			.catch(error =>
			{
				log(error);
				process.exit();
			});
	}
});
