const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 8080});

function init(createDataStream) {
	wss.on('connection', async ws => {
		await open(ws);

		const updateRequestList = createDataStream(data => 
			ws.send(data));

		wss.on('message', requests => {
			updateRequestList(requests);
		});

		wss.on('close', () => updateRequestList([]));
	});

}

function open(ws) {
	return new Promise(resolve => ws.on('open', resolve));
}

module.exports = init;