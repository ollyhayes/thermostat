function createChunksSet(maxSize = -1) {
	const set = new Set();

	return {
		add(chunk) {
			set.add(chunkToCode(chunk));

			if (maxSize !== -1 && set.size > maxSize) // think about this
				set.delete(set.entries().next());
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