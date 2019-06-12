import {timeMinute, timeHour, timeWeek} from 'd3-time';

export default function createDataStore() {
	const store = new Map();

	return {
		getRequests(minDate, maxDate) {
			const precisionLevel = getPrecisionLevel(minDate, maxDate);
			const requests = requestsFromDates(minDate, maxDate, precisionLevel);

			return requests
				.map(({requestCode}) => store.get(requestCode))
				.filter(request => request);

		},
		storeRequest(request) {
			request.requestCode = requestToCode(request);
			store.set(request.requestCode, request);
		},
		getMissingRequests(minDate, maxDate) {
			const precisionLevel = getPrecisionLevel(minDate, maxDate);
			const requests = requestsFromDates(minDate, maxDate, precisionLevel);

			return requests.filter(({requestCode}) => !store.has(requestCode));
		}
	};
}

function getPrecisionLevel(minDate, maxDate) {
	const minuteLimit = (maxDate.getTime() - minDate.getTime()) / (1000 * 60); // how many minutes are we looking at
	const hourLimit = minuteLimit / 60;
	return hourLimit > 50
		? 2
		: minuteLimit > 75
			? 1
			: 0;
}

// move this to common place!! shared with requests-set
function requestToCode({minDate, maxDate, precisionLevel}) {
	return '' + minDate.getTime() + maxDate.getTime() + precisionLevel;
}

function requestsFromDates(minDate, maxDate, precisionLevel) {
	const {range, offset} = getRangeForPrecisionLevel(precisionLevel);

	return range(minDate, maxDate)
		.map(minRequestDate => ({
			minDate: minRequestDate,
			maxDate: offset(minRequestDate),
			precisionLevel: precisionLevel,
		}))
		.map(request => ({
			...request,
			requestCode: requestToCode(request)
		}));
	// .filter(request => !receivedRequests.has(request));
	// think about ordering from the center out (do the above twice?)
}

function getRangeForPrecisionLevel(precisionLevel) {
	function tools(interval, step) {
		return {
			range: (start, stop) =>
				interval
					.every(step)
					.range(interval.offset(start, -step), stop),
			offset: date => interval.offset(date, step)
		};
	}
	switch (precisionLevel) {
	case 0: return tools(timeMinute, 5);
	case 1: return tools(timeHour, 5);
	case 2: return tools(timeWeek, 1);
	}
}