import { nest as d3Nest } from 'd3-collection';
import { getTemperatureExtent } from './utils';
import {thermometers} from '../../../common/config.json';

const nest = d3Nest()
	.key(d => d.id);

const thermometerColours = thermometers.reduce((colours, {colour, id}) => ({
	...colours,
	[id]: colour
}),{});

const socket = new self.WebSocket(`ws://${self.location.hostname}:8081`);
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
	const {temperatures, request} = JSON.parse(data);
	console.log(`got: ${temperatures.length} values`);

	const requestParsed = {
		minDate: new Date(request.minDate),
		maxDate: new Date(request.maxDate),
		precisionLevel: request.precisionLevel
	};

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

	const requestComplete = {
		data: nestedData,
		minTemperature: extent[0],
		maxTemperature: extent[1],
		...requestParsed
	};

	self.postMessage(requestComplete);
};

function distinctify(innerFunction) {
	let previousArgument = null;

	return (currentArgument) => {
		if (currentArgument === previousArgument)
			return;

		previousArgument = currentArgument;
		innerFunction(currentArgument);
	};
}