import {timeMinute, timeHour, timeWeek} from 'd3-time';

export function chunkToCode({minDate, maxDate, precisionLevel}) {
	return '' + minDate.getTime() + maxDate.getTime() + precisionLevel;
}

export function getChunkContaining(date) {
	const interval = timeMinute.every(5);

	const chunk = ({
		minDate: interval(date),
		maxDate: interval.ceil(date),
		precisionLevel: 0,
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

	function getChunkInterval(precisionLevel) {
		switch (precisionLevel) {
		case 0: return {interval: timeMinute, step: 5};
		case 1: return {interval: timeHour, step: 5};
		case 2: return {interval: timeWeek, step: 1};
		}
	}

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