const log = require('../../common/log');
const createRequestsSet = require('../public/scripts/requests-set');

function createDataStreamCreator(database) {
	return function createDataStream(sendUpdate) {
		let requestsList = [];
		const completedRequests = createRequestsSet(50);

		function processRequests() {
			const newRequest = requestsList[0];

			log('new request'.cyan + `: ${requestToString(newRequest)},` +
				'requsts'.cyan + `: ${requestsList.map(requestToString)},` +
				'completed'.cyan + `: ${completedRequests.size()}`);

			completedRequests.add(newRequest);

			const newRequestIndex = requestsList.indexOf(newRequest);
			if (newRequestIndex !== -1)
				requestsList.splice(newRequestIndex, 1);

			const temperatures = database.read(
				newRequest.minDate,
				newRequest.maxDate,
				newRequest.precisionLevel);
			sendUpdate({temperatures, request: newRequest});

			if (requestsList.length)
				setTimeout(processRequests);
		}

		return function updateRequestList(requests) {
			const triggerRequests = requestsList.length === 0;

			requestsList = requests
				.map(({minDate, maxDate, precisionLevel}) => ({
					minDate: new Date(minDate),
					maxDate: new Date(maxDate),
					precisionLevel
				}))
				.filter(request => !completedRequests.has(request));

			if (triggerRequests && requestsList.length)
				processRequests();
		};
	};
}

function requestToString({minDate, precisionLevel}) {
	return `${minDate.getHours()}:${minDate.getMinutes()}:${precisionLevel}`.green;
}

module.exports = createDataStreamCreator;