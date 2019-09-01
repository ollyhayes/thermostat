import {timeFormat, timeParse} from 'd3-time-format';

const specifier = '%y-%m-%d-%H-%M-%S';
const formatTime = timeFormat(specifier);
const parseTime = timeParse(specifier);
const dateFinder = /#range=(\d\d-\d\d-\d\d-\d\d-\d\d-\d\d),(\d\d-\d\d-\d\d-\d\d-\d\d-\d\d)/;

export function parseHash() {
	const result = dateFinder.exec(window.location.hash);

	const domain = result
		? result.slice(1).map(parseTime)
		: null;

	return domain;
}

export function createSaver(initialDomain, loadDomain) {

	window.addEventListener('popstate', () => loadDomain(parseHash()));
	
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
		return [{},
			'',
			`#range=${formatTime(domain[0])},${formatTime(domain[1])}`];
	}
}