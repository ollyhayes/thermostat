import {timeMinutes} from 'd3-time';

import getTemperature, { getTemperatureExtent } from './data-repository';
import createRequestsSet from './requests-set';

// self.addEventListener('message', async ({data: [startDate, endDate]}) => {
// 	const data = await getTemperature(startDate, endDate);

// 	const extent = getTemperatureExtent(data);

// 	self.postMessage({data, extent, startDate, endDate});
// });

const socket = new self.WebSocket('ws://localhost:8081');
const receivedRequests = createRequestsSet();
let lastRequests = '';

socket.onopen = function () {
	console.log('socket connected');

	self.addEventListener('message', async ({data: [startDate, endDate]}) => {
		const requests = requestsFromDates(startDate, endDate, 0);

		if (requests !== lastRequests && requests.length > 0) {
			lastRequests = requests;
			socket.send(JSON.stringify(requests));
		}
	});
};

function requestsFromDates(minDate, maxDate, precisionLevel) {
	// 5 minute increments

	const range =  timeMinutes(minDate, maxDate, 5);

	return timeMinutes(minDate, maxDate, 5)
		.map(minRequestDate => ({
			minDate: minRequestDate,
			maxDate: new Date(minRequestDate.getTime() + 5 * 60 * 1000 - 1000),
			precisionLevel: precisionLevel
		}))
		.filter(request => !receivedRequests.has(request));
	// first need to floor the range, using minDate - minDate % 5 or something?
	// think about ordering from the center out (do the above twice?)
	// remove throttler

	// in the onmessage
	// parse etc
	// record which request we've had back
	// postMessage to the frond end
	// maybe turn to a line (actually this means we'll need access to tohe domain etc)
	// 		also for re-rendering we'd prob wanna do that in the main thread so maybe this is pointless
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

	const request2 = {
		minDate: new Date(request.minDate),
		maxDate: new Date(request.maxDate),
		precisionLevel: request.precisionLevel
	};
	

	receivedRequests.add(request2);
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