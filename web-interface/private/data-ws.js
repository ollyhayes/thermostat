const WebSocket = require('ws');

function init(server, createDataStream) {
	const wss = new WebSocket.Server({server});

	wss.on('connection', async ws => {
		console.log('connected');

		const updateChunkList = createDataStream(data => 
			ws.send(JSON.stringify(data)));

		ws.on('message', json => updateChunkList(JSON.parse(json)));
		ws.on('close', () => updateChunkList([]));
	});
}

module.exports = init;