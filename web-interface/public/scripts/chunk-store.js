import { chunkToCode } from './chunk-utils';

export default function createChunkStore() {
	const store = new Map();

	return {
		getChunks(chunks) {
			return chunks
				.map(({chunkCode}) => store.get(chunkCode))
				.filter(chunk => chunk && chunk.thermometers.length > 0);

		},
		storeChunk(chunk) {
			chunk.chunkCode = chunkToCode(chunk);

			const existingChunk = store.get(chunk.chunkCode);

			if (existingChunk)
				chunk.thermometers = chunk.thermometers.map(newThermometer => ({
					...newThermometer,
					temperatures: getTemperaturesForThermometer(existingChunk.thermometers, newThermometer.thermometerId)
						.concat(newThermometer.temperatures)
						.sort(((first, second) => first.date - second.date))
				}));

			store.set(chunk.chunkCode, chunk);

			if (store.size > 50)
				store.delete(store.keys().next().value);
		},
		getMissingChunks(chunks) {
			return chunks.filter(({chunkCode}) => !store.has(chunkCode));
		}
	};
}

function getTemperaturesForThermometer(thermometers, thermometerId) {
	const thermometer = thermometers.find(existingThermometer => 
		existingThermometer.thermometerId === thermometerId);

	return thermometer
		? thermometer.temperatures
		: [];
}