const log = require('../../common/log');
const createChunksSet = require('./chunk-set');

function createDataStreamCreator(database) {
	return function createDataStream(sendUpdate) {
		let chunksList = [];
		const completedChunks = createChunksSet(50);

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

		return function updateChunkList(chunks) {
			const triggerChunks = chunksList.length === 0;

			chunksList = chunks
				.map(({minDate, maxDate, precisionLevel}) => ({
					minDate: new Date(minDate),
					maxDate: new Date(maxDate),
					precisionLevel
				}))
				.filter(chunk => !completedChunks.has(chunk));

			if (triggerChunks)
				processChunks();
		};
	};
}

function chunkToString({minDate, precisionLevel}) {
	return `${minDate.getHours()}:${minDate.getMinutes()}-${precisionLevel}`.green;
}

module.exports = createDataStreamCreator;