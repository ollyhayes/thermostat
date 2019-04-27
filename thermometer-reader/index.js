const getTemperature = require('./thermometer');
const log = require('../common/log');
const looper = require('./timeout-looper');
const Rx = require('rxjs');
const thermometers = require('../common/config.json')
	.thermometers
	.filter(thermometer => !thermometer.disabled);

function start(database) {
	const temperatures = looper(1000, () =>
		Promise.all(
			thermometers
				.map(async thermometer => ({
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
				error => log('temperature error: ' + error)));

	subscriptions.push(
		performAveraging(60 * 1000, temperatures)
			.subscribe(temperature => database.insert(temperature, 1)));

	subscriptions.push(
		performAveraging(3600 * 1000, temperatures)
			.subscribe(temperature => database.insert(temperature, 2)));

	return () => subscriptions.forEach(subscription => subscription.unsubscribe());
}

module.exports = {start};

function performAveraging(time, temperatures) {
	//this would look so much nicer in rxjs 6
	return temperatures
		.windowTime(time)
		.switchMap(window => 
			Rx.Observable.combineLatest(
				...thermometers.map((_, index) =>
					averageOver(
						window
							.map(windowArray => windowArray[index].temperature))
						.withLatestFrom(window
							.map(windowArray => windowArray[index]))
						.map(([average, latest]) =>
							({
								...latest,
								temperature: average
							})))));

	function averageOver(temperatures) {
		return Rx.Observable.combineLatest(
			temperatures.reduce((sum, next) => sum + next, 0),
			temperatures.count()
		)
			.map(([sum, count]) => sum / count);
	}
}
