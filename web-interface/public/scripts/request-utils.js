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