// const windowToDates;
// const datesToWindow;

function createDataStreamCreator(database) {
	return function createDataStream(sendUpdate) {
		let requestsList = [];
		let completedRequests = [];

		async function processRequests() {
			const newRequest = requestsList[0];

			console.log(`new request: ${newRequest}, requsts: ${requestsList}, completed: ${completedRequests}`);

			await new Promise(resolve => setTimeout(resolve, 1500));

			completedRequests.push(newRequest);
			if (completedRequests > 50) // think about this
				completedRequests.unshift();

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

			requestsList = requests.filter(request => !completedRequests.includes(request));

			if (triggerRequests)
				processRequests();
		};
	};
}

module.exports = createDataStreamCreator;