import { getRequestsForDateRange, requestToCode } from './request-utils';

export default function createDataStore() {
	const store = new Map();

	return {
		getRequests(minDate, maxDate) {
			const requests = getRequestsForDateRange(minDate, maxDate);

			return requests
				.map(({requestCode}) => store.get(requestCode))
				.filter(request => request);

		},
		storeRequest(request) {
			request.requestCode = requestToCode(request);
			store.set(request.requestCode, request);
		},
		getMissingRequests(minDate, maxDate) {
			const requests = getRequestsForDateRange(minDate, maxDate);

			return requests.filter(({requestCode}) => !store.has(requestCode));
		}
	};
}