const {from, interval} = require('rxjs');
const { delayWhen } = require('rxjs/operators');
const { performAveraging } = require('./averaging');

function assertResults(result, expected) {
	// couldn't be bothered to do this properly when I added the averaged date field
	const resultsWithoutDate = result.map(reading =>
		reading.map(thermometer => {
			const {date, ...otherFields} = thermometer;
			expect(date).toBeDefined();

			return otherFields;
		}));
	
	expect(resultsWithoutDate).toStrictEqual(expected);
}

test('normal averaging', async () => {
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
		pauseAfterEveryThreeValues(),
		performAveraging(500, thermometers)
	);

	const result = await toArray(temperatures);

	expect(result.length).toBe(2);

	assertResults(result, [
		[{ temperature: 6, serial: '1' }, { temperature: 16, serial: '2' },],
		[{ temperature: 9, serial: '1' }, { temperature: 19, serial: '2' },],
	]);
});

test('with missing thermometer', async () => {
	const thermometers = [
		{ serial: '1' }, { serial: '2' }
	];

	const thermometerReadings = [
		[{ temperature: 5, serial: '1' }],
		[{ temperature: 6, serial: '1' }],
		[{ temperature: 7, serial: '1' }],
		[{ temperature: 8, serial: '1' }],
		[{ temperature: 9, serial: '1' }],
		[{ temperature: 10, serial: '1' }],
	];

	const temperatures = from(thermometerReadings).pipe(
		pauseAfterEveryThreeValues(),
		performAveraging(500, thermometers)
	);

	const result = await toArray(temperatures);

	assertResults(result, [
		[{ temperature: 6, serial: '1' }],
		[{ temperature: 9, serial: '1' }],
	]);
});

test('with missing thermometer half way through', async () => {
	const thermometers = [
		{ serial: '1' }, { serial: '2' }
	];

	const thermometerReadings = [
		[{ temperature: 5, serial: '1' }, { temperature: 15, serial: '2' },],
		[{ temperature: 6, serial: '1' }, { temperature: 16, serial: '2' },],
		[{ temperature: 7, serial: '1' }],

		[{ temperature: 8, serial: '1' }],
		[{ temperature: 9, serial: '1' }],
		[{ temperature: 10, serial: '1' }],
	];

	const temperatures = from(thermometerReadings).pipe(
		pauseAfterEveryThreeValues(),
		performAveraging(500, thermometers)
	);

	const result = await toArray(temperatures);

	assertResults(result, [
		[{ temperature: 6, serial: '1' }, { temperature: 15.5, serial: '2' },],
		[{ temperature: 9, serial: '1' }]
	]);
});

test('with missing thermometer that reappears', async () => {
	const thermometers = [
		{ serial: '1' }, { serial: '2' }
	];

	const thermometerReadings = [
		[{ temperature: 5, serial: '1' }],
		[{ temperature: 6, serial: '1' }],
		[{ temperature: 7, serial: '1' }, { temperature: 17, serial: '2' },],

		[{ temperature: 8, serial: '1' }, { temperature: 18, serial: '2' },],
		[{ temperature: 9, serial: '1' }, { temperature: 19, serial: '2' },],
		[{ temperature: 10, serial: '1' }, { temperature: 20, serial: '2' },],
	];

	const temperatures = from(thermometerReadings).pipe(
		pauseAfterEveryThreeValues(),
		performAveraging(500, thermometers)
	);

	const result = await toArray(temperatures);

	assertResults(result, [
		[{ temperature: 6, serial: '1' }, { temperature: 17, serial: '2' },],
		[{ temperature: 9, serial: '1' }, { temperature: 19, serial: '2' },],
	]);
});

test('keeps other fields on the readings', async () => {
	const thermometers = [
		{ serial: '1' }, { serial: '2' }
	];

	const thermometerReadings = [
		[{ temperature: 5, serial: '1', id: 1 }, { temperature: 15, serial: '2', id: 2 },],
		[{ temperature: 6, serial: '1', id: 1 }, { temperature: 16, serial: '2', id: 2 },],
		[{ temperature: 7, serial: '1', id: 1 }, { temperature: 17, serial: '2', id: 2 },],

		[{ temperature: 8, serial: '1', id: 1 }, { temperature: 18, serial: '2', id: 2 },],
		[{ temperature: 9, serial: '1', id: 1 }, { temperature: 19, serial: '2', id: 2 },],
		[{ temperature: 10, serial: '1', id: 1 }, { temperature: 20, serial: '2', id: 2 },],
	];

	const temperatures = from(thermometerReadings).pipe(
		pauseAfterEveryThreeValues(),
		performAveraging(500, thermometers)
	);

	const result = await toArray(temperatures);

	expect(result.length).toBe(2);

	assertResults(result, [
		[{ temperature: 6, serial: '1', id: 1 }, { temperature: 16, serial: '2', id: 2 },],
		[{ temperature: 9, serial: '1', id: 1 }, { temperature: 19, serial: '2', id: 2 },],
	]);
});

function pauseAfterEveryThreeValues() {
	return delayWhen((value, index) => interval(Math.floor(index / 3) * 1000));
}

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