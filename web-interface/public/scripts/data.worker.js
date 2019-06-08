
import getTemperature, { getTemperatureExtent } from './data-repository';

self.addEventListener('message', async ({data: [startDate, endDate]}) => {
	const data = await getTemperature(startDate, endDate);

	const extent = getTemperatureExtent(data);

	self.postMessage({data, extent, startDate, endDate});
});

const socket = new self.WebSocket('ws://localhost:8081');
let currentDate = new Date(2019, 3, 21, 21, 0, 0);
const requests = [];

socket.onopen = function () {
	console.log('socket connected');
};

// Log errors
socket.onerror = function (error) {
	console.log('WebSocket Error ' + error);
};

// Log messages from the server
socket.onmessage = function (e) {
	console.log(`got: ${e.data}`);
};

function send(data) {
	const dataString = JSON.stringify(data);
	socket.send(dataString);
}

function startTest() {
	self.token = setInterval(() => {
		requests.push(nextRequest());
		send(requests);
		console.log(`sending ${requests.map(requestToString)}`);
	}, 1000);
}

function endTest() {
	clearInterval(self.token);
}
self.startTest = startTest;
self.endTest = endTest;

function nextRequest() {
	const minDate = new Date(currentDate);
	currentDate.setHours(currentDate.getHours() + 1);
	const maxDate = new Date(currentDate);

	return {
		minDate,
		maxDate,
		precisionLevel: 1
	};
}

function requestToString({minDate, precisionLevel}) {
	return `${minDate.getHours()}:${precisionLevel}`;
}