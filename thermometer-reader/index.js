const getTemperature = require('./thermometer');
const log = require('../common/log');
const looper = require('./timeout-looper');
const {combineLatest} = require('rxjs');
const {
	map,
	publishReplay,
	refCount,
	filter,
	windowTime,
	switchMap,
	withLatestFrom,
	reduce,
	count
} = require('rxjs/operators');

const {thermometers: allThermometers} = require('../common/config.json');

const thermometers = allThermometers.filter(thermometer => !thermometer.disabled);

function start(database) {
	const temperatures = looper(1000, () =>
		Promise.all(
			thermometers
				.map(async thermometer => ({
					...thermometer,
					temperature: await getTemperature(thermometer.serial),
				})))).pipe(
		map(thermometers => thermometers.filter(thermometer => thermometer.temperature !== null)),
		publishReplay(1),
		refCount());
	const minutelyTemperatures = temperatures.pipe(
		performAveraging(60 * 1000),
		publishReplay(1),
		refCount());
	const hourlyTemperatures = temperatures.pipe(
		performAveraging(3600 * 1000),
		publishReplay(1),
		refCount());

	const subscriptions = [];

	subscriptions.push(
		temperatures
			.subscribe(
				temperatures => database.insert(temperatures),
				error => log('temperature error: ' + error)));

	subscriptions.push(
		minutelyTemperatures
			.subscribe(temperature => database.insert(temperature, 1)));

	subscriptions.push(
		hourlyTemperatures
			.subscribe(temperature => database.insert(temperature, 2)));

	return {
		stopThermometer: () => subscriptions.forEach(subscription => subscription.unsubscribe()),
		newDataEmitter: [
			temperatures,
			minutelyTemperatures,
			hourlyTemperatures]
	};
}

module.exports = {start};

function performAveraging(time) {
	return observable =>
		observable.pipe(
			windowTime(time),
			switchMap(window => 
				combineLatest(
					...thermometers.map((_, index) =>
						window.pipe(
							map(windowArray => windowArray[index].temperature),
							averageOver(),
							withLatestFrom(window.pipe(map(windowArray => windowArray[index]))),
							map(([average, latest]) =>
								({
									...latest,
									temperature: average
								})))))));

	function averageOver() {
		return ovseravable => combineLatest(
			ovseravable.pipe(reduce((sum, next) => sum + next, 0)),
			ovseravable.pipe(count())
		).pipe(
			map(([sum, count]) => sum / count));
	}
}
