const log = require('../../common/log');

function createDataStreamCreator(database) {
	return function createDataStream(sendUpdate) {
		let requestsList = [];
		let completedRequests = new Set();
		// let completedRequests = [];

		async function processRequests() {
			const newRequest = requestsList[0];

			log('new request'.cyan + `: ${requestToString(newRequest)},` +
				'requsts'.cyan + `: ${requestsList.map(requestToString)},` +
				'completed'.cyan + `: ${completedRequests.size}`);

			completedRequests.add(requestToCode(newRequest));
			if (completedRequests > 50) // think about this
				completedRequests.entries().next();

			await new Promise(resolve => setTimeout(resolve, 1500));

			const newRequestIndex = requestsList.indexOf(newRequest);
			if (newRequestIndex !== -1)
				requestsList.splice(newRequestIndex, 1);

			// get the data
			sendUpdate(newRequest);

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
				.filter(request => !completedRequests.has(requestToCode(request)));

			if (triggerRequests && requestsList.length)
				processRequests();
		};
	};
}

function requestToCode({minDate, maxDate, precisionLevel}) {
	return '' + minDate.getTime() + maxDate.getTime() + precisionLevel;
}

function requestToString({minDate, precisionLevel}) {
	return `${minDate.getHours()}:${precisionLevel}`.green;
}

module.exports = createDataStreamCreator;