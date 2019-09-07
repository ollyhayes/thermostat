const log = require('../../common/log');
const createChunksSet = require('./chunk-set');

function createDataStreamCreator(database, dataEmitter) {
	return function createDataStream(sendUpdate) {
		let chunksList = [];
		const completedChunks = createChunksSet();
		let liveSubscription = null;

		function processChunks() {
			const newChunk = chunksList[0];

			if (!newChunk)
				return;

			log('new chunk'.cyan + `: ${chunkToString(newChunk)},` +
				'requsts'.cyan + `: ${chunksList.map(chunkToString)},` +
				'completed'.cyan + `: ${completedChunks.size()}`);

			completedChunks.add(newChunk);

			const newChunkIndex = chunksList.indexOf(newChunk);
			if (newChunkIndex !== -1)
				chunksList.splice(newChunkIndex, 1);

			const temperatures = database.read(
				newChunk.minDate,
				newChunk.maxDate,
				newChunk.precisionLevel);
			sendUpdate({temperatures, chunk: newChunk});

			if (chunksList.length)
				setTimeout(processChunks);
		}

		return {
			updateChunkList(rawChunks) {
			const chunks = rawChunks
				.map(({minDate, maxDate, precisionLevel}) => ({
					minDate: new Date(minDate),
					maxDate: new Date(maxDate),
					precisionLevel
				}))
				.filter(chunk => !completedChunks.has(chunk));

			const triggerChunks = chunksList.length === 0;
			chunksList = chunks

			if (triggerChunks)
				processChunks();
			},

			setLiveUpdates(config) {
				if (liveSubscription) {
					console.log('stopping updates');
					liveSubscription.unsubscribe();
					liveSubscription = null;
				}

				console.log('starting updates');

				if (config && dataEmitter) {
					const {startDate, precisionLevel} = config;
					const temperatures = database.read(
						startDate,
						undefined,
						precisionLevel);
					sendUpdate({temperatures, chunk: {special: true}});
					
					liveSubscription = dataEmitter.subscribe(temperatures => {
						console.log('emitting');
						sendUpdate({
							temperatures: temperatures.map(
								({temperature, id}) => ({
									temperature,
									id,
									date: new Date() // prob best to use same date as in db
								})),
							chunk: {
								special: true
							}
						});
					});
				}
			}
	};
}

function chunkToString({minDate, precisionLevel}) {
	return `${minDate.getHours()}:${minDate.getMinutes()}-${precisionLevel}`.green;
}

module.exports = createDataStreamCreator;