export default function throttle(innerFunction) {
	let inUse = false;

	return async (...args) => {
		if (inUse) {
			throw Error(`Throttling ${innerFunction.name} function`);
		} else {
			try {
				inUse = true;
				return await innerFunction(...args);
			} finally {
				inUse = false;
			}
		}
	};
}

// think of better name, the above is more of a lock
export function throttleTime(inner, time) {
	let queued = false;
	let callNextAt = null;

	return function trigger() {
		if (Date.now() > callNextAt) {
			makeCall();
		} else if (!queued) {
			queued = true;
			callAt(callNextAt - 30, makeCall);
		}

		function makeCall() {
			callNextAt = Date.now() + time;
			queued = false;

			inner();
		}
	}
}

function callAt(time, promise) {
	return new Promise(resolve =>
		setTimeout(async () => {
			await promise();
			resolve();
		}, time - Date.now())
	);
}

// function delay(promise, delay) {
// 	return new Promise(resolve => {
// 		setTimeout(async () => {
// 			await promise();
// 			resolve();
// 		}, delay);
// 	});
// }