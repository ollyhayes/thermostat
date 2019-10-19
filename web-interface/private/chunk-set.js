function createChunksSet(size, handleDropChunk) {
	const set = new Set();

	return {
		add(chunk) {
			set.add(chunkToCode(chunk));

			if (set.size > size) {
				const droppedChunk = set.keys().next().value;
				set.delete(droppedChunk);
				if (handleDropChunk)
					handleDropChunk(droppedChunk);
			}
		},
		has(chunk) {
			return set.has(chunkToCode(chunk));
		},
		size() {
			return set.size;
		}
	};
}

// when node supports es6 we can get this from chunk-utils.js
function chunkToCode({minDate, maxDate, precisionLevel}) {
	return '' + minDate.getTime() + maxDate.getTime() + precisionLevel;
}

module.exports = createChunksSet;