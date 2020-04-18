const WebSocket = require('ws');
const {serialiseTemperatures} = require('../public/scripts/temperature-serialiser');

function init(server, createDataStream) {
	const wss = new WebSocket.Server({server});

	wss.on('connection', async (ws, request) => {
		console.log('connected');

		const contentType = new URL(request.url, `http://${request.headers.host}`).searchParams.get('content-type');

		const updateChunkList = createDataStream(data => 
			ws.send(
				contentType === 'binary'
					? serialiseTemperatures(data)
					: JSON.stringify(data)
			)); // erro rhandler? ws doesn't close

		ws.on('message', json => updateChunkList(JSON.parse(json)));
		ws.on('close', () => updateChunkList([]));
	});
}

module.exports = init;