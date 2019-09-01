import {timeFormat, timeParse} from 'd3-time-format';

const specifier = '%y-%m-%d-%H-%M-%S';
const formatTime = timeFormat(specifier);
// const parseTime = timeParse(specifier);

export function createSaver(initialDomain, loadDomain) {

	window.addEventListener('popstate', event => {
		const {state: {domain}} = event;
		loadDomain(domain);
	});

	let lastTimeSaved = new Date();
	let lastDomainSaved = initialDomain;

	window.history.replaceState(...getHistoryArgs(initialDomain));

	return domain => {
		const currentDate = new Date();
		const args = getHistoryArgs(domain);

		if (currentDate - lastTimeSaved > 1000) {
			window.history.pushState(...lastDomainSaved);
			console.log('state pushed');
		}

		window.history.replaceState(...args);

		lastTimeSaved = currentDate;
		lastDomainSaved = args;
	};

	function getHistoryArgs(domain) {
		return [{ domain },
			'',
			`#range=${formatTime(domain[0])},${formatTime(domain[1])}`];
	}
}