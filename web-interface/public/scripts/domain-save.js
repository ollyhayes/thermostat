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

	window.history.pushState(...getHistoryArgs([new Date(2019,7,29,18,59,0), new Date(2019,7,29,20,1,0)]));
	window.history.pushState(...getHistoryArgs([new Date(2019,7,29,19,59,0), new Date(2019,7,29,21,1,0)]));
	window.history.pushState(...getHistoryArgs([new Date(2019,7,29,20,59,0), new Date(2019,7,29,22,1,0)]));
	window.history.pushState(...getHistoryArgs([new Date(2019,7,29,21,59,0), new Date(2019,7,29,23,1,0)]));
	window.history.pushState(...getHistoryArgs([new Date(2019,7,29,20,59,0), new Date(2019,7,29,23,1,0)]));
	window.history.pushState(...getHistoryArgs([new Date(2019,7,29,19,59,0), new Date(2019,7,29,22,1,0)]));
	window.history.pushState(...getHistoryArgs([new Date(2019,7,29,18,59,0), new Date(2019,7,29,21,1,0)]));
	window.history.pushState(...getHistoryArgs([new Date(2019,7,29,17,59,0), new Date(2019,7,29,20,1,0)]));

	return domain => {
		const currentDate = new Date();
		const args = getHistoryArgs(domain);

		if (currentDate - lastTimeSaved > 1000) {
			window.history.pushState(...lastDomainSaved);
			console.log('state pushed');
		}

		// window.history.replaceState(...args);

		lastTimeSaved = currentDate;
		lastDomainSaved = args;
	};

	function getHistoryArgs(domain) {
		return [{ domain },
			'',
			`#range=${formatTime(domain[0])},${formatTime(domain[1])}`];
	}
}