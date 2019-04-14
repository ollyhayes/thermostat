const getTemperature = require("./thermometer");
const log = require("../common/log");
const looper = require("./timeout-looper");

function start(database)
{
	const subscription = looper(1000, () => getTemperature())
		.subscribe(
			temperature => database.insert(temperature),
			error => log("temperature error: " + error));

	return () => subscription.unsubscribe();
}

module.exports = {start};