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

	return domain => {

		const currentDate = new Date();
		const args = [{ domain },
			'',
			`#range=${formatTime(domain[0])},${formatTime(domain[1])}`];

		// actually we need to put the push on a timeout that gets cancelled on another replace
		// that way if we go back we can also go forward
		// 	hmm, that won't work actually, because what if you don't pause before going back?
		//	actually, this should be working as is, because we're replacing the front most state, I think I'm seeing a separate bug
		if (currentDate - lastTimeSaved > 1000) {
			window.history.pushState(...lastDomainSaved);
			console.log('state pushed');
		}

		// window.history.replaceState(...args);

		lastTimeSaved = currentDate;
		lastDomainSaved = args;
	}
}