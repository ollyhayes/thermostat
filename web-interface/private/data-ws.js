const WebSocket = require('ws');

function init(server, createDataStream) {
	const wss = new WebSocket.Server({server});

	wss.on('connection', async ws => {
		console.log('connected');

		const updateChunkList = createDataStream(data => 
			ws.send(JSON.stringify(data)));

		ws.on('message', json => {
			const requestedChunks = JSON.parse(json);

			console.log(`receiving: ${requestedChunks.length} chunks`);
			updateChunkList(requestedChunks);
		});

		ws.on('close', () => updateChunkList([]));
	});
}

module.exports = init;