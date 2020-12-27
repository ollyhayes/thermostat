import bs from 'binary-search';

function getIndex(store, time) {
	// -x-x-x-
	// 0011223
	const result = bs(store, time, (e, n) => e.date - n);

	return result < 0
		? -result - 1
		: result;
}

function getIndexExclusive(store, time) {
	// -x-x-x-
	// 0112233
	const result = bs(store, time, (e, n) => e.date - n);

	return result < 0
		? -result - 1
		: result + 1;
}

export function getValues(store, startTime, endTime) {
	const startIndex = getIndex(store, startTime);
	const endIndex = getIndexExclusive(store, endTime);

	return store.slice(startIndex, endIndex);
}

export function storeValues(store, values) {
	const startIndex = getIndex(store, values[0].date);
	const endIndex = getIndexExclusive(store, values[values.length - 1].date);

	store.splice(startIndex, endIndex - startIndex, ...values);
}

export function deleteValues(store, startTime, endTime) {
	const startIndex = getIndex(store, startTime);
	const endIndex = getIndexExclusive(store, endTime);

	store.splice(startIndex, endIndex - startIndex);
}