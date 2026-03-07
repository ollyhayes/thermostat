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

const thermometers = allThermometers.filter(thermometer => !thermometer.disabled && thermometer.type === 'thermometer');
const pumpSensor = allThermometers.find(thermometer => !thermometer.disabled && thermometer.type === 'binary-sensor');

function start(database) {
	const temperatures = looper(1000, () => {
		return Promise.all(thermometers
			.map(async (thermometer) => {
				// await new Promise(resolve => setTimeout(resolve, 300 * index)); // added this when there were issues reading multiple thermometers at once
				// // it would just return empty string for one thermometer 
				return {
					...thermometer,
					temperature: await getTemperature(thermometer.serial)
				};
			}));
	})
		.pipe(
			map(thermometers => {
				const date = new Date();
				return thermometers
					.filter(thermometer => thermometer.temperature !== null)
					.map(thermometer => ({...thermometer, date}));
			}),
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
		? startBinarySensor(pumpSensor.pin, pumpSensor.mock).pipe(
			map(state => [{
				...pumpSensor,
				date: new Date(),
				temperature: state ? 1 : 0
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