const log = require('../../common/log');
const createChunksSet = require('./chunk-set');

function createDataStreamCreator(database, dataEmitters) {
	return function createDataStream(sendUpdate) {
		let chunksList = [];
		//let currentTime = // let's update this from the emitter and use that everywhere?
		const completedChunks = createChunksSet(125);

		const liveSubscriptions = dataEmitters.map((dataEmitter, index) =>
			dataEmitter.subscribe(handleNewEmission(index)));

		function processChunks() {
			const newChunk = chunksList[0];

			if (!newChunk)
				return;

			if (!completedChunks.has(newChunk)) {
				log('new chunk'.cyan + `: ${chunkToString(newChunk)},` +
					'requsts'.cyan + `: ${chunksList.map(chunkToString)},` +
					'completed'.cyan + `: ${completedChunks.size()}`);

				completedChunks.add(newChunk);

				const temperatures = database.read(
					newChunk.minDate,
					newChunk.maxDate,
					newChunk.precisionLevel);
				sendUpdate({temperatures, chunk: newChunk});
			}

			const newChunkIndex = chunksList.indexOf(newChunk);
			if (newChunkIndex !== -1)
				chunksList.splice(newChunkIndex, 1);

			if (chunksList.length)
				setTimeout(processChunks);
		}

		return function updateChunkList(rawChunks) {
			if (rawChunks.length === 0) {
				log('closing connection');
				chunksList = rawChunks;
				liveSubscriptions.forEach(subscription => subscription.unsubscribe());
				return;
			}

			log(`receiving: ${rawChunks.length} chunks`);

			const triggerChunks = chunksList.length === 0;
			chunksList = rawChunks
				.map(chunk => ({
					...chunk,
					minDate: new Date(chunk.minDate),
					maxDate: new Date(chunk.maxDate)
				}));


			if (triggerChunks)
				processChunks();
		};

		function handleNewEmission(precisionLevel) {
			return temperatures => {
				log(`emitting at precision level: ${precisionLevel}`);
				sendUpdate({
					temperatures,
					chunk: {
						special: true,
						precisionLevel
					}
				});
			};
		}
	};
}

function chunkToString({minDate, precisionLevel}) {
	return `${minDate.getHours()}:${minDate.getMinutes()}-${precisionLevel}`.green;
}

module.exports = createDataStreamCreator;
