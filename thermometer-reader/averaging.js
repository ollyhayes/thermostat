const { map, bufferTime, } = require('rxjs/operators');
const {groupBy, flatten, mapObjIndexed, values, sum} = require('ramda');

function performAveraging(time) {
	return observable =>
		observable.pipe(
			bufferTime(time),
			map(readingsPerSecond => {
				const readings = flatten(readingsPerSecond);
				const readingsByThermometer = groupBy(reading => reading.serial, readings);

				const averages = mapObjIndexed((readings, serial) => {
					const temperatures = readings.map(reading => reading.temperature);
					return {
						...readings[0],
						date: new Date(Date.now() - time / 2),
						temperature: sum(temperatures) / temperatures.length,
					};
				}, readingsByThermometer);

				return values(averages);
			}));
}

module.exports = {performAveraging};