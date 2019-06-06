const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 8081});

function init(createDataStream) {
	wss.on('connection', async ws => {
		console.log('connected');

		// this waits for open, but we wait for data anyway so I don't think we need it
		// I think even that it is not for the server, client event only
		// await open(ws);
		// console.log('open');

		// using a data stream per socket is this okay?
		// maybe we can rely one the event loop to controlo the queue
		const updateRequestList = createDataStream(data => 
			ws.send(data));

		ws.on('message', requestsJson => {
			const requests = JSON.parse(requestsJson);
			console.log(requests);
			updateRequestList(requests);
		});

		ws.on('close', () => updateRequestList([]));
	});
}

function open(ws) {
	return new Promise(resolve => ws.on('open', resolve));
}

module.exports = init;