import {webInterface} from '../../../common/config.json';
import {deserialiseTemperatures} from './temperature-serialiser.cjs';

const dataType = webInterface.dataType;

export default function initialise(handleData) {
	const socket = new WebSocket(`ws://${window.location.host}?content-type=${dataType}`);
	socket.binaryType = 'arraybuffer';
	let firstChunks = null;

	socket.onopen = function () {
		console.log('socket connected');
		if (firstChunks) {
			socket.send(JSON.stringify(firstChunks));
			firstChunks = null;
		}
	};

	socket.onerror = function (error) {
		console.log('WebSocket Error ' + error);
	};

	socket.onmessage = function ({data}) {
		const {temperatures, chunk} = dataType === 'binary'
			? deserialiseTemperatures(new Int32Array(data))
			: parseData(data);

		handleData(chunk, temperatures);
	};

	return function sendData(chunks) {
		if (chunks.length > 0) {
			if (socket.readyState === 0)
				firstChunks = chunks;
			else
				socket.send(JSON.stringify(chunks));
		}
	};
}

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