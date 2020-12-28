const {Gpio} = require('onoff');
const {Observable} = require('rxjs');
const log = require('../common/log');

exports.startBinarySensor = function() {
	return new Observable(observer => {
		// let state = 0;
		// let timeoutId = 0;

		// function handleSensorChange() {
		// 	state = !state;

		// 	observer.next(state);
		// 	log(`sensor update: ${state}`);

		// 	timeoutId = setTimeout(handleSensorChange, (Math.random() * 5 + 2.5) * 60 * 1000); // every 3.5-6.5m
		// }

		// handleSensorChange();

		// return () => {
		// 	clearTimeout(timeoutId);
		// };

		const sensor = new Gpio(pin, 'in', 'both', {debounceTimeout: 30});
		let state = sensor.readSync();
		observer.next(state);

		sensor.watch((error, newState) => {
			state = !!newState;
			observer.next(state);
			log(`sensor update: ${state}`);
		});

		return () => {
			sensor.unexport();
		};
	});
};
