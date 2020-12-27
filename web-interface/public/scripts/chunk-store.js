import bs from 'binary-search';

function getIndex(store, time) {
	const result = bs(store, time, (e, n) => e.date - n);

	return result === -1
		? -1
		: result < 0
			? -result - 2 // this somehow gets the value immediately before the search time
			: result;
}

export function getValues(store, startTime, endTime) {
	const startIndex = getIndex(store, startTime);
	const endIndex = getIndex(store, endTime) + 1;

	return store.slice(startIndex === -1 ? 0 : startIndex, endIndex);
}

export function storeValues(store, values) {
	const startIndex = getIndex(store, values[0].date);
	const endIndex = getIndex(store, values[values.length - 1].date);

	if (endIndex !== startIndex) {
		console.log(`failed: ${values[values.length - 1].date}, start: ${startIndex}, end: ${endIndex}`);
	}

	store.splice(startIndex + 1, undefined, ...values);
}

export function deleteValues(store, startTime, endTime) {
	const startIndex = getIndex(store, startTime);
	const endIndex = getIndex(store, endTime);

	console.log('deleting not implemented');
	// if (endIndex !== startIndex) {
	// 	console.log(`failed: ${values[values.length - 1].date}, start: ${startIndex}, end: ${endIndex}`);
	// }

	// store.splice(startIndex + 1, undefined, ...values);
}