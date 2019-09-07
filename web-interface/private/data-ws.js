const WebSocket = require('ws');

function init(server, createDataStream) {
	const wss = new WebSocket.Server({server});

	wss.on('connection', async ws => {
		console.log('connected');

		const {updateChunkList, setLiveUpdates} = createDataStream(data => 
			ws.send(JSON.stringify(data)));

		ws.on('message', json => {
			const {requestedChunks, liveUpdates} = JSON.parse(json);

			if (requestedChunks !== undefined) {
				console.log(`receiving: ${requestedChunks.length} chunks`);
				updateChunkList(requestedChunks);
			}

			if (liveUpdates !== undefined)
				setLiveUpdates(liveUpdates);
		});

		ws.on('close', () => updateChunkList([]));
	});
}

module.exports = init;