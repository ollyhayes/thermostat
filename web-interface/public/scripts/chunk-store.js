import {thermometers} from '../../../common/config.json';

export default function createChunkStore() {
	const storesPerThermometer = [];
	thermometers.forEach(thermometer => storesPerThermometer[thermometer.id] = new Map());


	const stores = [
		storesPerThermometer
		// thermometers.map(thermometer => ({
		// 	id: thermometer.id,
		// 	data: new Map()
		// })),
		// thermometers.map(thermometer => ({
		// 	id: thermometer.id,
		// 	data: new Map()
		// }))
	];

	// const store = new Map();
	function getDataByThermometer(startTime, endTime, precisionLevel, id) {
		if (precisionLevel != 0)
			return [];

		const store = stores[precisionLevel][id];
		const start = Math.round(startTime.getTime() / 1000);
		const end = Math.round(endTime.getTime() / 1000);
		const data = [];

		for (let t = start; t <= end; t++) {
			const temperature = store.get(t);
			if (temperature)
				data.push(temperature);
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
			if (precisionLevel != 0)
				return;

			const store = stores[precisionLevel];

			data.forEach(reading => store[reading.id].set(
				Math.round(reading.date.getTime() / 1000), // start using rounded date for the special, so we can remove the rounding
				reading));
		}
		// getMissingChunks(chunks) {
		// 	// this'll have to be done separately, we'll need to keep a list of the chunks we requested
		// 	return chunks.filter(({chunkCode}) => {
		// 		const chunk = store.get(chunkCode);
		// 		return !chunk || chunk.special;
		// 	});
		// }
	};
}