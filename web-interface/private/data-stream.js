// const windowToDates;
// const datesToWindow;

function createDataStreamCreator(database) {
	return function createDataStream(sendUpdate) {
		let requestsList = [];
		let completedRequests = [];
		let i = 0;

		function processRequests() {
			const newRequest = requestsList.find(request => !completedRequests.includes(request));

			// there must be a better way!
			requestsList = requestsList.filter(request => request !== newRequest);

			// get the data
			sendUpdate(newRequest + i++);

			// update completedRequests (pushing out the end)

			// for debug EDIT: what the hell is this?
			// completedRequests(newRequest);

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