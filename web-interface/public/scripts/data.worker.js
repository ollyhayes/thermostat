import { nest as d3Nest } from 'd3-collection';
import { getTemperatureExtent } from './utils';

const nest = d3Nest()
	.key(d => d.id);

const socket = new self.WebSocket(`ws://${self.location.hostname}:8080`);
const sendData = distinctify(requests => socket.send(requests));
let firstRequests = null;

socket.onopen = function () {
	console.log('socket connected');
	if (firstRequests) {
		socket.send(JSON.stringify(firstRequests));
		firstRequests = null;
	}
};

self.addEventListener('message', ({data: requests}) => {
	if (requests.length > 0) {

		if (socket.readyState === 0)
			firstRequests = requests;
		else
			sendData(JSON.stringify(requests));
	}
});

socket.onerror = function (error) {
	console.log('WebSocket Error ' + error);
};

socket.onmessage = function ({data}) {
	const {temperatures, request} = parseData(data);

	const groupedByThermometer = nest.entries(temperatures)
		.map(({key, values}) => ({
			thermometerId: key,
			temperatures: values
		}));

	const [minTemperature, maxTemperature] = getTemperatureExtent(temperatures);

	const requestComplete = {
		thermometers: groupedByThermometer,
		minTemperature,
		maxTemperature,
		...request
	};

	self.postMessage(requestComplete);
};

function parseData(json) {
	const {temperatures, request} = JSON.parse(json);

	return {
		temperatures: temperatures.map(dataPoint => ({
			...dataPoint,
			date: new Date(dataPoint.date),
		})),
		request: {
			minDate: new Date(request.minDate),
			maxDate: new Date(request.maxDate),
			precisionLevel: request.precisionLevel
		} 
	};
}

function distinctify(innerFunction) {
	let previousArgument = null;

	return (currentArgument) => {
		if (currentArgument === previousArgument)
			return;

		previousArgument = currentArgument;
		innerFunction(currentArgument);
	};
}