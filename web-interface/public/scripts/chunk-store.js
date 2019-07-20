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
			store.set(chunk.chunkCode, chunk);
		},
		getMissingChunks(chunks) {
			return chunks.filter(({chunkCode}) => !store.has(chunkCode));
		}
	};
}