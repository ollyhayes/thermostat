const {from, interval, of} = require('rxjs');
const { delayWhen, tap } = require('rxjs/operators');
const { performAveraging } = require('./averaging');

test('averaging', async () => {

	const thermometers = [
		{ serial: '1' }, { serial: '2' }
	];

	const thermometerReadings = [
		[{ temperature: 5, serial: '1' }, { temperature: 15, serial: '2' },],
		[{ temperature: 6, serial: '1' }, { temperature: 16, serial: '2' },],
		[{ temperature: 7, serial: '1' }, { temperature: 17, serial: '2' },],

		[{ temperature: 8, serial: '1' }, { temperature: 18, serial: '2' },],
		[{ temperature: 9, serial: '1' }, { temperature: 19, serial: '2' },],
		[{ temperature: 10, serial: '1' }, { temperature: 20, serial: '2' },],
	];

	const temperatures = from(thermometerReadings).pipe(
		delayWhen((value, index) => index >= 3
			? interval(2000)
			: of(1)
		),
		// tap(console.log),
		performAveraging(1000, thermometers)
	);

	const result = await toArray(temperatures);

	expect(result).toStrictEqual([
		[{ temperature: 6, serial: '1' }, { temperature: 16, serial: '2' },],
		[{ temperature: 9, serial: '1' }, { temperature: 19, serial: '2' },],
	]);
});

function toArray(observable) {
	return new Promise((resolve, reject) => {
		const result = [];
		observable.subscribe({
			next: value => result.push(value),
			complete: () => resolve(result),
			error: error => reject(error)
		});
	});
}