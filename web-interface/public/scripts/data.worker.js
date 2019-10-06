import { nest as d3Nest } from 'd3-collection';
import { getTemperatureExtent } from './utils';

const nest = d3Nest()
	.key(d => d.id);

const socket = new self.WebSocket(`ws://${self.location.host}`);
let firstChunks = null;

socket.onopen = function () {
	console.log('socket connected');
	if (firstChunks) {
		socket.send(JSON.stringify(firstChunks));
		firstChunks = null;
	}
};

self.addEventListener('message', ({data: chunks}) => {
	if (chunks.length > 0) {
		if (socket.readyState === 0)
			firstChunks = chunks;
		else
			socket.send(JSON.stringify(chunks));
	}
});

socket.onerror = function (error) {
	console.log('WebSocket Error ' + error);
};

socket.onmessage = function ({data}) {
	const {temperatures, chunk} = parseData(data);

	const groupedByThermometer = nest.entries(temperatures)
		.map(({key, values}) => ({
			thermometerId: +key,
			temperatures: values
		}));

	const [minTemperature, maxTemperature] = getTemperatureExtent(temperatures);

	const chunkComplete = {
		thermometers: groupedByThermometer,
		minTemperature,
		maxTemperature,
		...chunk
	};

	self.postMessage(chunkComplete);
};

function parseData(json) {
	const {temperatures, chunk} = JSON.parse(json);

	return {
		temperatures: temperatures.map(dataPoint => ({
			...dataPoint,
			date: new Date(dataPoint.date),
		})),
		chunk: chunk.special
			? chunk
			: {
				...chunk,
				minDate: new Date(chunk.minDate),
				maxDate: new Date(chunk.maxDate),
			} 
	};
}