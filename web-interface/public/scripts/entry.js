import '../less/page.less';
import drawChart from './drawChart';

if ('ontouchstart' in window)
	document.addEventListener('touchstart', () => {});

document.addEventListener('DOMContentLoaded', () =>
{
	const root = document.querySelector('.root');
	drawChart(root);

	socketTest();
});

function socketTest() {
	const socket = new WebSocket('ws://localhost:8081');

	socket.onopen = function () {
		// socket.send('Ping'); // Send the message 'Ping' to the server
		console.log('socket connected');
		socket.send(JSON.stringify(['a', 'b', 'c']));
		console.log('text sent');
	};
	
	// // Log errors
	// socket.onerror = function (error) {
	// 	console.log('WebSocket Error ' + error);
	// };
	
	// // Log messages from the server
	// socket.onmessage = function (e) {
	// 	console.log('Server: ' + e.data);
	// };

	console.log('socket connected');
	// socket.send('test');
	// console.log('text sent');
}