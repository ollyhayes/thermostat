import { chunkToCode, nextChunkCode, previousChunkCode } from './chunk-utils';

export default function createChunkStore() {
	const store = new Map();
	window.store = store;

	return {
		getChunks(chunks) {
			return chunks
				.map(({chunkCode}) => store.get(chunkCode))
				.filter(chunk => chunk && chunk.thermometers.length > 0);

		},
		storeChunk(chunk) {
			chunk.chunkCode = chunkToCode(chunk);

			const existingChunk = store.get(chunk.chunkCode);
			if (existingChunk) {
				chunk.thermometers = chunk.thermometers.map(newThermometer => ({
					...newThermometer,
					temperatures: concat(
						getTemperaturesForThermometer(existingChunk.thermometers, newThermometer.thermometerId),
						newThermometer.temperatures,
						chunk.special // if this is _not_ the special, it's the main chunk so it should go at the start
					)
				}));
				chunk.minTemperature = Math.min(chunk.minTemperature, existingChunk.minTemperature);
				chunk.maxTemperature = Math.max(chunk.maxTemperature, existingChunk.maxTemperature);

				if (!existingChunk.special)
					chunk.special = false;

			}

			store.delete(chunk.chunkCode); // always ensure new chunk is at front of queue
			store.set(chunk.chunkCode, chunk);

			if (store.size > 50)
				store.delete(store.keys().next().value);
		},
		getMissingChunks(chunks) {
			return chunks.filter(({chunkCode}) => {
				const chunk = store.get(chunkCode);
				return !chunk || chunk.special;
			});
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

function concat(existingChunk, newChunk, append) {
	return append
		? existingChunk.concat(newChunk)
		: newChunk.concat(existingChunk);
}