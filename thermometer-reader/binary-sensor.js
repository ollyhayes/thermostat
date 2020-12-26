// const {Gpio} = require('onoff');
const {Observable} = require('rxjs');
const log = require('../common/log');

exports.startBinarySensor = function() {
	return new Observable(observer => {
		let state = 0;
		let timeoutId = 0;

		function handleSensorChange() {
			state = !state;

			observer.next(state);
			log(`sensor update: ${state}`);

			timeoutId = setTimeout(handleSensorChange, (Math.random() * 5 + 2.5) * 60 * 1000); // every 3.5-6.5m
		}

		handleSensorChange();

		return () => {
			clearTimeout(timeoutId);
		};

		// const sensor = new Gpio(pin, 'in', 'both', {debounceTimeout: 30});
		// let state = sensor.readSync();

		// sensor.watch((error, newState) => {
		// 	state = !!newState;
		// 	log(`sensor update: ${state}`);
		// });

		// const subscription = interval(1000).pipe(
		// 	map(() => state)
		// ).subscribe(observer);

		// return () => {
		// 	subscription.unsubscribe();
		// 	sensor.unexport();
		// };
	});
};
