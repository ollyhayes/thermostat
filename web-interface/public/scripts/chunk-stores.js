import {thermometers} from '../../../common/config.json';
import {groupBy, forEachObjIndexed} from 'ramda';
import { deleteValues, getValues, storeValues } from './chunk-store';

export default function createChunkStoreArray() {
	function createStore() {
		const storesPerThermometer = [];
		thermometers.forEach(thermometer => storesPerThermometer[thermometer.id] = []);
		return storesPerThermometer;
	}

	const stores = [
		createStore(),
		createStore(),
		createStore(),
		createStore(),
	];

	return {
		getData(startTime, endTime, precisionLevel) {
			return thermometers
				.filter(thermometer => !thermometer.disabled && !thermometer.hidden)
				.map(({id}) => {
					const store = stores[precisionLevel][id];
					return {
						thermometerId: id,
						temperatures: getValues(store, startTime, endTime),
						curveType: 'continuous'
					};
				});
		},
		storeData(data, precisionLevel) {
			const dataByThermometer = groupBy(d => d.id, data);

			forEachObjIndexed(
				(readings, id) => {
					const store = stores[precisionLevel][id];
					storeValues(store, readings);
				},
				dataByThermometer);
		},
		dropData(startTime, endTime, precisionLevel) {
			thermometers.forEach(id => {
				const store = stores[precisionLevel][id];
				deleteValues(store, startTime, endTime);
			});
		}
	};
}