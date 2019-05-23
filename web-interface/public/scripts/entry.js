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
	const socket = new WebSocket('ws://locahost:8080');
	socket.
}