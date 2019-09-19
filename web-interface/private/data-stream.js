const log = require('../../common/log');
const createChunksSet = require('./chunk-set');

function createDataStreamCreator(database, dataEmitter) {
	return function createDataStream(sendUpdate) {
		let chunksList = [];
		//let currentTime = // let's update this from the emitter and use that everywhere?
		const completedChunks = createChunksSet();
		let emitNextValue = false; // will need to store the precisionLevel

		const liveSubscription = dataEmitter.subscribe(handleNewEmission);

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

			emitNextValue = newChunk.isPartial; // only works because db reads are synchronous 😱

			if (chunksList.length)
				setTimeout(processChunks);
		}

		function handleNewEmission(temperatures) {
			if (!emitNextValue)
				return;

			emitNextValue = false;
			log('emitting');
			sendUpdate({
				temperatures: temperatures.map(
					({temperature, id}) => ({
						temperature,
						id,
						date: new Date() // prob best to use same date as in db
					})),
				chunk: {
					special: true,
					isPartial: true
				}
			});
		}

		return function updateChunkList(rawChunks) {
			if (rawChunks === []) {
				log('closing connection');
				chunksList = rawChunks;
				liveSubscription.unsubscribe();
				return;
			}

			const currentDate = new Date();
			const triggerChunks = chunksList.length === 0;
			chunksList = rawChunks
				.map(chunk => ({
					...chunk,
					minDate: new Date(chunk.minDate),
					maxDate: new Date(chunk.maxDate)
				}))
				.map(chunk => ({
					...chunk,
					isPartial: chunk.maxDate > currentDate,
				}));

			log(`receiving: ${chunksList.length} chunks, ` + 
				`${chunksList.filter(chunk => chunk.isPartial).length} partial`);

			if (triggerChunks)
				processChunks();
		};
	};
}

function chunkToString({minDate, precisionLevel}) {
	return `${minDate.getHours()}:${minDate.getMinutes()}-${precisionLevel}`.green;
}

module.exports = createDataStreamCreator;