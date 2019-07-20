const WebSocket = require('ws');

function init(server, createDataStream) {
	const wss = new WebSocket.Server({server});

	wss.on('connection', async ws => {
		console.log('connected');

		// this waits for open, but we wait for data anyway so I don't think we need it
		// I think even that it is not for the server, client event only
		// await open(ws);
		// console.log('open');

		// using a data stream per socket is this okay?
		// maybe we can rely one the event loop to controlo the queue
		const updateChunkList = createDataStream(data => 
			ws.send(JSON.stringify(data)));

		ws.on('message', chunksJson => {
			const chunks = JSON.parse(chunksJson);
			console.log(`receiving: ${chunks.length} chunks`);

			updateChunkList(chunks);
		});

		ws.on('close', () => updateChunkList([]));
	});
}

function open(ws) {
	return new Promise(resolve => ws.on('open', resolve));
}

module.exports = init;