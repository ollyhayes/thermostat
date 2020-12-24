const {combineLatest} = require('rxjs');
const {
	map,
	filter,
	windowTime,
	switchMap,
	withLatestFrom,
	reduce,
	count
} = require('rxjs/operators');

const {thermometers: allThermometers} = require('../common/config.json');

const thermometers = allThermometers.filter(thermometer => !thermometer.disabled);

// error in here somewhere, something like if a thermometers goes missing half way through a window or something?
// then the thermometerId is null
function performAveraging(time) {
	return observable =>
		observable.pipe(
			windowTime(time),
			switchMap(window => 
				combineLatest(
					...thermometers.map(thermometer =>
						window.pipe(
							ofThermometer(thermometer.serial),
							filter(thermometer => thermometer !== undefined),
							map(thermometer => thermometer.temperature), // dud thermometer. I think we should iterate over values and find the the matchin one in the config after
							averageOver(),
							withLatestFrom(window.pipe(ofThermometer(thermometer.serial))),
							map(([average, latest]) =>
								({
									...latest,
									temperature: average
								}))))).pipe(
					map(averagedThemometers => averagedThemometers.filter(thermometer => !isNaN(thermometer.temperature))) // filter out the dud thermometers
				)));

	function ofThermometer(serial) {
		return observable => observable.pipe(
			map(windowArray => windowArray.find(({serial: innerSerial}) => innerSerial === serial))
		);
	}

	function averageOver() {
		return ovseravable => combineLatest(
			ovseravable.pipe(reduce((sum, next) => sum + next, 0)),
			ovseravable.pipe(count())
		).pipe(
			map(([sum, count]) => sum / count));
	}
}

module.exports = {performAveraging};