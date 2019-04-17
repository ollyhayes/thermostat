const getTemperature = require("./thermometer");
const log = require("../common/log");
const looper = require("./timeout-looper");
const Rx = require("rxjs");
const thermometers = require("../common/config.json");

function start(database) {
	const temperatures = looper(1000, () =>
		Promise.all(
			thermometers.map(async thermometer => ({
				...thermometer,
				temperature: await getTemperature(thermometer.serial),
			}))))
		.publishReplay(1)
		.refCount();

	const subscriptions = [];

	subscriptions.push(
		temperatures
			.subscribe(
				temperatures => database.insert(temperatures),
				error => log("temperature error: " + error)));

	// subscriptions.push(
	// 	averageOver(60 * 1000, temperatures)
	// 		.subscribe(temperature => database.insert(temperature, 1)));

	// subscriptions.push(
	// 	averageOver(3600 * 1000, temperatures)
	// 		.subscribe(temperature => database.insert(temperature, 2)));

	return () => subscriptions.forEach(subscription => subscription.unsubscribe());
}

module.exports = {start};

function averageOver(time, temperatures) {
	return temperatures
		.windowTime(time)
		.switchMap(window => 
			Rx.Observable.combineLatest(
				window.reduce((sum, next) => sum + next, 0),
				window.count()
			))
		.map(([sum, count]) => sum / count)
}
