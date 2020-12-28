const getTemperature = require('./thermometer');
const log = require('../common/log');
const looper = require('./timeout-looper');
const {
	map,
	filter,
	publishReplay,
	refCount,
} = require('rxjs/operators');
const {EMPTY, interval, combineLatest} = require('rxjs');
const {performAveraging} = require('./averaging');

const {thermometers: allThermometers} = require('../common/config.json');
const { startBinarySensor } = require('./binary-sensor');

const thermometers = allThermometers.filter(thermometer => !thermometer.disabled);
const pumpSensor = {pin: 1, id: 15}; // get from config

function start(database) {
	const temperatures = looper(1000, () => {
		const date = new Date();
		return Promise.all(thermometers
			.filter(thermometer => thermometer.type === 'thermometer')
			.map(async thermometer => ({
				...thermometer,
				temperature: await getTemperature(thermometer.serial),
				date
			})));
	})
		.pipe(
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

	const pumpSensorState = pumpSensor
		? startBinarySensor(pumpSensor.pin).pipe(
			map(state => [{
				...pumpSensor,
				date: new Date(),
				temperature: state ? 20 : 15
			}]),
			publishReplay(1),
			refCount())
		: EMPTY;

	const subscriptions = [];

	subscriptions.push(
		temperatures
			.subscribe(
				temperatures => database.insert(temperatures),
				error => log('temperature error: ' + error)));

	subscriptions.push(
		minutelyTemperatures
			.subscribe(temperatures => database.insert(temperatures, 1)));

	subscriptions.push(
		hourlyTemperatures
			.subscribe(temperatures => database.insert(temperatures, 2)));

	subscriptions.push(
		pumpSensorState
			.subscribe(
				values => database.insert(values, 3)));

	const pumpSensorEmitter = combineLatest([pumpSensorState, interval(1000)])
		.pipe(
			filter(([pump]) => pump),
			map(([[{id, temperature}]]) => [{
				id,
				temperature,
				date: new Date()
			}])
		);

	return {
		stopThermometer: () => subscriptions.forEach(subscription => subscription.unsubscribe()),
		newDataEmitter: [
			temperatures,
			minutelyTemperatures,
			hourlyTemperatures,
			pumpSensorEmitter
		]
	};
}

module.exports = {start};