function createRequestsSet(maxSize = -1) {
	const set = new Set();

	return {
		add(request) {
			set.add(requestToCode(request));

			if (maxSize !== -1 && set.size > maxSize) // think about this
				set.delete(set.entries().next());
		},
		has(request) {
			return set.has(requestToCode(request));
		},
		size() {
			return set.size;
		}
	};
}

function requestToCode({minDate, maxDate, precisionLevel}) {
	return '' + minDate.getTime() + maxDate.getTime() + precisionLevel;
}

module.exports = createRequestsSet;