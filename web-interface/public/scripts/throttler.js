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