import {timeMinute, timeHour, timeWeek} from 'd3-time';

export function chunkToCode({minDate, maxDate, precisionLevel}) {
	return '' + minDate.getTime() + maxDate.getTime() + precisionLevel;
}

export function nextChunkCode({minDate, maxDate, precisionLevel}) {
	return '' + maxDate.getTime() + (+maxDate + (maxDate - minDate)) + precisionLevel;
	// this doesn't work because we need to take the steps into account
	// const {interval} = getChunkInterval(precisionLevel);
	// return '' + maxDate.getTime() + interval.ceil(+maxDate + 1).getTime() + precisionLevel;
}

export function previousChunkCode({minDate, maxDate, precisionLevel}) {
	return '' + (minDate - (maxDate - minDate)) + minDate.getTime() + precisionLevel;
	// const {interval} = getChunkInterval(precisionLevel);
	// return '' + interval.floor(minDate.getTime() - 1) + minDate.getTime() + precisionLevel;
}

export function getChunkContaining(date, precisionLevel) {
	const {interval: unstepped, step} = getChunkInterval(precisionLevel);
	const interval = unstepped.every(step);

	const chunk = ({
		minDate: interval.floor(date),
		maxDate: interval.ceil(date),
		precisionLevel,
	});

	return {
		...chunk,
		chunkCode: chunkToCode(chunk)
	};
}

export function getChunksForDateRange(minDate, maxDate) {
	const precisionLevel = getPrecisionLevelForDateRange(minDate, maxDate);
	const {interval, step} = getChunkInterval(precisionLevel);

	return interval
		.every(step)
		.range(interval.offset(minDate, -step), maxDate)
		.map(minDate => ({
			minDate,
			maxDate: interval.offset(minDate, step),
			precisionLevel: precisionLevel,
		}))
		.map(chunk => ({
			...chunk,
			chunkCode: chunkToCode(chunk)
		}));

	function getPrecisionLevelForDateRange(minDate, maxDate) {
		const minuteLimit = (maxDate.getTime() - minDate.getTime()) / (1000 * 60); // how many minutes are we looking at
		const hourLimit = minuteLimit / 60;
		return hourLimit > 50
			? 2
			: minuteLimit > 75
				? 1
				: 0;
	}
}

function getChunkInterval(precisionLevel) {
	switch (precisionLevel) {
	case 0: return {interval: timeMinute, step: 5};
	case 1: return {interval: timeHour, step: 6};
	case 2: return {interval: timeWeek, step: 1};
	}
}

// turn a list of chunks (each with it's own list of themometer readings)
// into one big list of thermometer readings (plug min/max temp)
export function flattenChunks(chunks) {

	return chunks.reduce(({thermometerReadings, minTemperature, maxTemperature}, nextChunk) => ({
		minTemperature: Math.min(minTemperature, nextChunk.minTemperature),
		maxTemperature: Math.max(maxTemperature, nextChunk.maxTemperature),
		thermometerReadings: [
			...thermometerReadings,
			...nextChunk.thermometers.map(thermometerData => ({
				...thermometerData,
				key: nextChunk.chunkCode + thermometerData.thermometerId
			}))
		]
	}), {minTemperature: Number.MAX_VALUE, maxTemperature: Number.MIN_VALUE, thermometerReadings: []});
}

export function createChunksChangedCalculator() {
	let previousChunks = null;

	return newChunks => {
		const chunksChanged = previousChunks === null
			|| newChunks.length !== previousChunks.length
			|| newChunks.some((chunk, index) => chunk.chunkCode !== previousChunks[index].chunkCode);

		previousChunks = newChunks;
		return chunksChanged;
	};
}