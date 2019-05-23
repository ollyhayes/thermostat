const windowToDates;
const datesToWindow;

function createDataStreamCreator(database) {
	return function createDataStream(sendUpdate) {
		let requestsList = [];
		let completedRequests = {};
		let requestIndex = 0;

		function processRequests() {
			const newRequest = requestsList.find(request => !completedRequests.includes(request));

			// get the data
			// sendUpdate(data);

			// update completedRequests (pushing out the end)

			// for debug
			completedRequests(newRequest);

			completedRequests.push(newRequest);
			if (completedRequests > 50) // think about this
				completedRequests.unshift();

			if (requestsList.length)
				setTimeout(processRequests);
		}

		return function updateRequestList(requests) {
			const triggerRequests = requestsList.length === 0;

			requestsList = requests;

			if (triggerRequests)
				processRequests();
		};
	};
}

module.exports = createDataStreamCreator;