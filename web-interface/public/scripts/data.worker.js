import {timeMinutes} from 'd3-time';
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
const socketOpen = new Promise(resolve => socket.addEventListener('open', resolve));
const receivedRequests = createRequestsSet();
let lastRequests = '';

socket.onopen = function () {
	console.log('socket connected');
};

self.addEventListener('message', async ({data: [startDate, endDate]}) => {
	const requests = requestsFromDates(startDate, endDate, 0);

	if (requests !== lastRequests && requests.length > 0) {
		lastRequests = requests;

		await socketOpen;
		socket.send(JSON.stringify(requests));
	}
});

function requestsFromDates(minDate, maxDate, precisionLevel) {
	const flooredDate = new Date(minDate.getTime() - minDate.getTime() % (5 * 60 * 1000));

	return timeMinutes(flooredDate, maxDate, 5)
		.map(minRequestDate => ({
			minDate: minRequestDate,
			maxDate: new Date(minRequestDate.getTime() + 5 * 60 * 1000 - 1000),
			precisionLevel: precisionLevel
		}))
		.filter(request => !receivedRequests.has(request));
	// think about ordering from the center out (do the above twice?)
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

	self.postMessage({data: nestedData, extent});
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