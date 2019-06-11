import {timeMinute, timeHour, timeWeek} from 'd3-time';
import { nest as d3Nest } from 'd3-collection';

import getTemperature, { getTemperatureExtent } from './data-repository';
import createRequestsSet from './requests-set';
import {thermometers} from '../../../common/config.json';

const nest = d3Nest()
	.key(d => d.id);

const thermometerColours = thermometers.reduce((colours, {colour, id}) => ({
	...colours,
	[id]: colour
}),{});

// self.addEventListener('message', async ({data: [startDate, endDate]}) => {
// 	const data = await getTemperature(startDate, endDate);

// 	const extent = getTemperatureExtent(data);

// 	self.postMessage({data, extent, startDate, endDate});
// });

const socket = new self.WebSocket('ws://localhost:8081');
const receivedRequests = createRequestsSet();
let lastRequests = '';
let firstRequests = null;

socket.onopen = function () {
	console.log('socket connected');
	if (firstRequests) {
		socket.send(JSON.stringify(firstRequests));
		firstRequests = null;
	}
};

self.addEventListener('message', ({data: {minDate, maxDate, precisionLevel}}) => {
	
	const requests = requestsFromDates(minDate, maxDate, precisionLevel);

	if (requests !== lastRequests && requests.length > 0) {
		lastRequests = requests;

		if (socket.readyState === 0)
			firstRequests = requests;
		else
			socket.send(JSON.stringify(requests));
	}
});

function requestsFromDates(minDate, maxDate, precisionLevel) {
	const {range, offset} = getRangeForPrecisionLevel(precisionLevel);

	return range(minDate, maxDate)
		.map(minRequestDate => ({
			minDate: minRequestDate,
			maxDate: offset(minRequestDate),
			precisionLevel: precisionLevel
		}))
		.filter(request => !receivedRequests.has(request));
	// think about ordering from the center out (do the above twice?)
}

function getRangeForPrecisionLevel(precisionLevel) {
	function tools(interval, step) {
		return {
			range: (start, stop) =>
				interval
					.every(step)
					.range(interval.offset(start, -1), interval.offset(stop, 1)),
			offset: date => interval.offset(date, step)
		};
	}
	switch (precisionLevel) {
	case 0: return tools(timeMinute, 5);
	case 1: return tools(timeHour, 5);
	case 2: return tools(timeWeek, 1);
	}
}

// const socket = new self.WebSocket('ws://localhost:8081');
// let currentDate = new Date(2019, 3, 21, 21, 0, 0);
// const requests = [];

// Log errors
socket.onerror = function (error) {
	console.log('WebSocket Error ' + error);
};

// Log messages from the server
socket.onmessage = function ({data}) {
	const {temperatures, request} = JSON.parse(data);
	console.log(`got: ${temperatures.length} values`);

	const requestParsed = {
		minDate: new Date(request.minDate),
		maxDate: new Date(request.maxDate),
		precisionLevel: request.precisionLevel
	};

	receivedRequests.add(requestParsed);

	if (!temperatures.length)
		return;

	const parsedData = temperatures.map(dataPoint => ({
		...dataPoint,
		date: new Date(dataPoint.date),
	}));

	const nestedData = nest.entries(parsedData)
		.map(({key, values}) => ({
			key,
			colour: thermometerColours[key],
			values
		}));

	const extent = getTemperatureExtent(nestedData);

	self.postMessage({data: nestedData, extent, request});
};

// function send(data) {
// 	const dataString = JSON.stringify(data);
// 	socket.send(dataString);
// }

// function startTest() {
// 	self.token = setInterval(() => {
// 		requests.push(nextRequest());
// 		send(requests);
// 		console.log(`sending ${requests.map(requestToString)}`);
// 	}, 1000);
// }

// function endTest() {
// 	clearInterval(self.token);
// }
// self.startTest = startTest;
// self.endTest = endTest;

// function nextRequest() {
// 	const minDate = new Date(currentDate);
// 	currentDate.setHours(currentDate.getHours() + 1);
// 	const maxDate = new Date(currentDate);

// 	return {
// 		minDate,
// 		maxDate,
// 		precisionLevel: 0
// 	};
// }

// function requestToString({minDate, precisionLevel}) {
// 	return `${minDate.getHours()}:${precisionLevel}`;
// }