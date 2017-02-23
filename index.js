const Database = require("./database");
const getTemperature = require("./thermometer");
const process = require("process");	
const log = require("./log");
const Rx = require("rxjs");

//new Database()
//	.open()
//	.then(database => 
//	{
//		const subscription = getTemperature()
//			.subscribe(
//				temperature => database.insert(temperature),
//				error => console.log("temp error: ", error),
//				complete => console.log("complete: ", complete));
//	})
//	.catch(error => console.log("database error: ", error));

const database = new Database();

const subscription = Rx.Observable.concat(
		Rx.Observable.fromPromise(database.open()),
		getTemperature)
	.subscribe(
		temperature => database.insert(temperature),
		error => log("temperature error: " + error),
		complete => log("complete: " + complete)
	);

new Promise(resolve => process.on("exit", () => resolve()))
	.then(() =>
	{
		log("process exited - unsubscribing");
		subscription.unsubscribe();
		log("closing database");
		return database.close();
	})
	.then(() => log("database closed"))
	.catch(error => log(error));
