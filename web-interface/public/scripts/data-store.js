import { requestToCode } from './request-utils';

export default function createDataStore() {
	const store = new Map();

	return {
		getRequests(requests) {
			return requests
				.map(({requestCode}) => store.get(requestCode))
				.filter(request => request && request.thermometers.length > 0);

		},
		storeRequest(request) {
			request.requestCode = requestToCode(request);
			store.set(request.requestCode, request);
		},
		getMissingRequests(requests) {
			return requests.filter(({requestCode}) => !store.has(requestCode));
		}
	};
}