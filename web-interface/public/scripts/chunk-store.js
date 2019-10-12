import {thermometers} from '../../../common/config.json';
import {timeSecond, timeMinute, timeHour} from 'd3-time';

export default function createChunkStore() {
	function createStore() {
		const storesPerThermometer = [];
		thermometers.forEach(thermometer => storesPerThermometer[thermometer.id] = new Map());
		return storesPerThermometer;
	}

	const stores = [
		createStore(),
		createStore(),
		createStore()
	];

	function getDataByThermometer(startTime, endTime, precisionLevel, id) {
		const store = stores[precisionLevel][id];

		const interval = getInterval(precisionLevel);
		const start = interval.floor(startTime).getTime();
		const end = interval.ceil(endTime).getTime();
		const step = getStep(precisionLevel);

		const data = [];

		for (let t = start; t <= end; t += step) {
			const temperature = store.get(t);
			if (temperature)
				data.push(temperature);
		}

		return data;
	}

	function dropDataByThermometer(startTime, endTime, precisionLevel, id) {
		const store = stores[precisionLevel][id];

		const interval = getInterval(precisionLevel);
		const start = interval.floor(startTime).getTime();
		const end = interval.ceil(endTime).getTime();
		const step = getStep(precisionLevel);

		const data = [];

		for (let t = start; t <= end; t += step) {
			store.delete(t);
		}

		return data;
	}

	return {
		getData(startTime, endTime, precisionLevel) {
			return thermometers.map(({id}) => ({
				thermometerId: id,
				temperatures: getDataByThermometer(startTime, endTime, precisionLevel, id)
			}));
		},
		storeData(data, precisionLevel) {
			const store = stores[precisionLevel];

			data.forEach(reading => store[reading.id].set(
				getInterval(precisionLevel).floor(reading.date).getTime(),
				reading));
		},
		dropData(startTime, endTime, precisionLevel) {
			thermometers.forEach(({id}) => 
				dropDataByThermometer(startTime, endTime, precisionLevel, id));
		}
	};
}

function getInterval(precisionLevel) {
	switch (precisionLevel) {
	case 0: return timeSecond;
	case 1: return timeMinute;
	case 2: return timeHour;
	}
}

function getStep(precisionLevel) {
	switch (precisionLevel) {
	case 0: return 1 * 1000;
	case 1: return 60 * 1000;
	case 2: return 60 * 60 * 1000;
	}
}