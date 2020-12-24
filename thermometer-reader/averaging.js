const { map, bufferTime, } = require('rxjs/operators');
const {groupBy, flatten, mapObjIndexed, values, sum} = require('ramda');

function performAveraging(time, thermometers) {
	return observable =>
		observable.pipe(
			bufferTime(time),
			map(readingsPerTime => {
				const readings = flatten(readingsPerTime);
				const readingsPerThermometer = groupBy(reading => reading.serial, readings);

				const averages = mapObjIndexed((readings, serial) => {
					const temperatures = readings.map(reading => reading.temperature);
					return {
						serial,
						temperature: sum(temperatures) / temperatures.length
					};
				}, readingsPerThermometer);

				return values(averages);
			}));
}

module.exports = {performAveraging};

// do we really need the config in here, could just average everything by serial and spit it back out, and combine each with their config later
// can we create a custom partition instead of using ofThermometer/filter?