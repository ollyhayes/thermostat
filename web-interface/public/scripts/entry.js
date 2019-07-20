import '../less/page.less';
import drawChart from './drawChart';

if ('ontouchstart' in window)
	document.addEventListener('touchstart', () => {});

document.addEventListener('DOMContentLoaded', () =>
{
	const root = document.querySelector('.root');
	drawChart(root);

	// socketTest();
});

function socketTest() {
	const socket = new WebSocket('ws://localhost:8081');
	const chunks = [1, 2, 3];
	let currentRequest = 4;

	socket.onopen = function () {
		console.log('socket connected');
	};
	
	// Log errors
	socket.onerror = function (error) {
		console.log('WebSocket Error ' + error);
	};
	
	// Log messages from the server
	socket.onmessage = function (e) {
		chunks.splice(chunks.indexOf(Number(e.data)), 1);
		console.log(`got: ${e.data}, chunks: ${chunks}`);
	};

	function send(data) {
		const dataString = JSON.stringify(data);
		socket.send(dataString);
		console.log(`sending ${dataString}`);
	}

	window.startTest = function() {
		window.token = setInterval(() => {
			chunks.push(currentRequest++);
			send(chunks);
		}, 1000);
	};

	window.endTest = function() {
		clearInterval(window.token);
	};
}