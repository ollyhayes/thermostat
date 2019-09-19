import { chunkToCode, nextChunkCode, previousChunkCode } from './chunk-utils';

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
			if (existingChunk) {
				chunk.thermometers = chunk.thermometers.map(newThermometer => ({
					...newThermometer,
					temperatures: concat(
						getTemperaturesForThermometer(existingChunk.thermometers, newThermometer.thermometerId),
						newThermometer.temperatures,
						chunk.special // if this is _not_ the special, it's the main chunk so it should go at the start
					)
				}));
			} else {
				const nextChunk = store.get(nextChunkCode(chunk));
				if (nextChunk) {
					chunk.thermometers = chunk.thermometers.map(newThermometer => ({
						...newThermometer,
						temperatures: newThermometer.temperatures.concat(
							getTemperaturesForThermometer(nextChunk.thermometers, newThermometer.thermometerId).slice(0,1)
						)
					}));
				}

				const previousChunk = store.get(previousChunkCode(chunk));
				if (previousChunk) {
					previousChunk.thermometers = previousChunk.thermometers.map(previousThemometer => ({
						...previousThemometer,
						temperatures: previousThemometer.temperatures.concat(
							getTemperaturesForThermometer(chunk.thermometers, previousThemometer.thermometerId).slice(0,1)
						)
					}));
				}
			}

			store.set(chunk.chunkCode, chunk);

			if (store.size > 50)
				store.delete(store.keys().next().value);

			return existingChunk !== undefined
				// || previousChunk !== undefined;
		},
		getMissingChunks(chunks) {
			return chunks.filter(({chunkCode}) => {
				const chunk = store.get(chunkCode);
				return !chunk || chunk.maxDate > new Date();
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