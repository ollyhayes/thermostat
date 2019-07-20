import {timeMinute, timeHour, timeWeek} from 'd3-time';

export function requestToCode({minDate, maxDate, precisionLevel}) {
	return '' + minDate.getTime() + maxDate.getTime() + precisionLevel;
}

export function getRequestsForDateRange(minDate, maxDate) {
	const precisionLevel = getPrecisionLevelForDateRange(minDate, maxDate);
	const {interval, step} = getRequestInterval(precisionLevel);

	return interval
		.every(step)
		.range(interval.offset(minDate, -step), maxDate)
		.map(minDate => ({
			minDate,
			maxDate: interval.offset(minDate, step),
			precisionLevel: precisionLevel,
		}))
		.map(request => ({
			...request,
			requestCode: requestToCode(request)
		}));

	function getRequestInterval(precisionLevel) {
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

// turn a list of requests (each with it's own list of themometer readings)
// into one big list of thermometer readings (plug min/max temp)
export function flattenRequests(requests) {

	return requests.reduce(({thermometerReadings, minTemperature, maxTemperature}, nextRequest) => ({
		minTemperature: Math.min(minTemperature, nextRequest.minTemperature),
		maxTemperature: Math.max(maxTemperature, nextRequest.maxTemperature),
		thermometerReadings: [
			...thermometerReadings,
			...nextRequest.thermometers.map(thermometerData => ({
				...thermometerData,
				key: nextRequest.requestCode + thermometerData.thermometerId
			}))
		]
	}), {minTemperature: Number.MAX_VALUE, maxTemperature: Number.MIN_VALUE, thermometerReadings: []});
}

export function createRequestsChangedCalculator() {
	let previousRequests = null;

	return newRequests => {
		const requestsChanged = previousRequests === null
			|| newRequests.length !== previousRequests.length
			|| newRequests.some((request, index) => request.requestCode !== previousRequests[index].requestCode);
		previousRequests = newRequests;
		return requestsChanged;
	};
}