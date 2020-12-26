const getTemperature = require('./thermometer');
const log = require('../common/log');
const looper = require('./timeout-looper');
const {
	map,
	publishReplay,
	refCount,
} = require('rxjs/operators');
const {merge, EMPTY} = require('rxjs');
const {performAveraging} = require('./averaging');

const {thermometers: allThermometers} = require('../common/config.json');
const { startBinarySensor } = require('./binary-sensor');

const thermometers = allThermometers.filter(thermometer => !thermometer.disabled);
const pumpSensor = {pin: 1, id: 15}; // get from config

function start(database) {
	const temperatures = looper(1000, () =>
		Promise.all(thermometers
			.filter(thermometer => thermometer.type === 'thermometer')
			.map(async thermometer => ({
				...thermometer,
				temperature: await getTemperature(thermometer.serial),
				date: new Date()
			}))))
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
				temperature: state ? 20 : 15
			}]),
			publishReplay(1),
			refCount())
		: EMPTY;

	const updates = merge(temperatures, pumpSensorState).pipe(
		publishReplay(1),
		refCount());

	const subscriptions = [];

	subscriptions.push(
		updates
			.subscribe(
				temperatures => database.insert(temperatures),
				error => log('temperature error: ' + error)));

	subscriptions.push(
		minutelyTemperatures
			.subscribe(temperatures => database.insert(temperatures, 1)));

	subscriptions.push(
		hourlyTemperatures
			.subscribe(temperatures => database.insert(temperatures, 2)));

	return {
		stopThermometer: () => subscriptions.forEach(subscription => subscription.unsubscribe()),
		newDataEmitter: [
			updates,
			minutelyTemperatures,
			hourlyTemperatures]
	};
}

module.exports = {start};