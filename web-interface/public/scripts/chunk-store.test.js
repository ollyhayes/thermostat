import {deleteValues, getValues, storeValues} from './chunk-store.js';

describe('exact matches', () => {
	test('insert values into gap', () => {
		const store = [
			{ date: 8 },
			{ date: 11 },
		];

		storeValues(store, [
			{ date: 9 },
			{ date: 10 },
		]);

		expect(store).toStrictEqual([
			{ date: 8 },
			{ date: 9 },
			{ date: 10 },
			{ date: 11 },
		]);
	});

	test('insert values before start', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
		];

		storeValues(store, [
			{ date: 6 },
			{ date: 7 },
		]);

		expect(store).toStrictEqual([
			{ date: 6 },
			{ date: 7 },
			{ date: 8 },
			{ date: 9 },
		]);
	});

	test('insert values after end', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
		];

		storeValues(store, [
			{ date: 10 },
			{ date: 11 },
		]);

		expect(store).toStrictEqual([
			{ date: 8 },
			{ date: 9 },
			{ date: 10 },
			{ date: 11 },
		]);
	});

	test('insert values before with overlap', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
		];

		storeValues(store, [
			{ date: 7 },
			{ date: 8 },
		]);

		expect(store).toStrictEqual([
			{ date: 7 },
			{ date: 8 },
			{ date: 9 },
		]);
	});

	test('insert values in middle', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
		];

		storeValues(store, [
			{ date: 8 },
			{ date: 9 },
		]);

		expect(store).toStrictEqual([
			{ date: 8 },
			{ date: 9 },
		]);
	});

	test('get values in the middle', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
			{ date: 10 },
			{ date: 11 },
			{ date: 12 },
		];

		const values = getValues(store, 9, 10);

		expect(values).toStrictEqual([
			{ date: 9 },
			{ date: 10 },
		]);
	});

	test('get values at the end', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
			{ date: 10 },
			{ date: 11 },
			{ date: 12 },
		];

		const values = getValues(store, 11, 15);

		expect(values).toStrictEqual([
			{ date: 11 },
			{ date: 12 },
		]);
	});

	test('get values at the start', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
			{ date: 10 },
			{ date: 11 },
			{ date: 12 },
		];

		const values = getValues(store, 6, 9);

		expect(values).toStrictEqual([
			{ date: 8 },
			{ date: 9 },
		]);
	});

	test('delete values', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
			{ date: 10 },
			{ date: 11 },
			{ date: 12 },
		];

		deleteValues(store, 9, 10);

		expect(store).toStrictEqual([
			{ date: 8 },
			{ date: 11 },
			{ date: 12 },
		]);
	});
});

describe('inexact', () => {
	test('insert values into gap', () => {
		const store = [
			{ date: 8 },
			{ date: 11 },
		];

		storeValues(store, [
			{ date: 9.1 },
			{ date: 10.1 },
		]);

		expect(store).toStrictEqual([
			{ date: 8 },
			{ date: 9.1 },
			{ date: 10.1 },
			{ date: 11 },
		]);
	});

	test('insert values before start', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
		];

		storeValues(store, [
			{ date: 6 },
			{ date: 7.9 },
		]);

		expect(store).toStrictEqual([
			{ date: 6 },
			{ date: 7.9 },
			{ date: 8 },
			{ date: 9 },
		]);
	});

	test('insert values after end', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
		];

		storeValues(store, [
			{ date: 9.1 },
			{ date: 11 },
		]);

		expect(store).toStrictEqual([
			{ date: 8 },
			{ date: 9 },
			{ date: 9.1 },
			{ date: 11 },
		]);
	});

	test('insert values before with overlap', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
		];

		storeValues(store, [
			{ date: 7 },
			{ date: 8.1 },
		]);

		expect(store).toStrictEqual([
			{ date: 7 },
			{ date: 8.1 },
			{ date: 9 },
		]);
	});

	test('insert values in middle', () => {
		const store = [
			{ date: 7.9 },
			{ date: 9.1 },
		];

		storeValues(store, [
			{ date: 7.9 },
			{ date: 9.1 },
		]);

		expect(store).toStrictEqual([
			{ date: 7.9 },
			{ date: 9.1 },
		]);
	});

	test('get values in the middle', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
			{ date: 10 },
			{ date: 11 },
			{ date: 12 },
		];

		const values = getValues(store, 8.9, 10.9);

		expect(values).toStrictEqual([
			{ date: 9 },
			{ date: 10 },
		]);
	});

	test('get values at the end', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
			{ date: 10 },
			{ date: 11 },
			{ date: 12 },
		];

		const values = getValues(store, 10.9, 15);

		expect(values).toStrictEqual([
			{ date: 11 },
			{ date: 12 },
		]);
	});

	test('get values at the start', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
			{ date: 10 },
			{ date: 11 },
			{ date: 12 },
		];

		const values = getValues(store, 6, 9.1);

		expect(values).toStrictEqual([
			{ date: 8 },
			{ date: 9 },
		]);
	});

	test('delete values', () => {
		const store = [
			{ date: 8 },
			{ date: 9 },
			{ date: 10 },
			{ date: 11 },
			{ date: 12 },
		];

		deleteValues(store, 9.1, 10.1);

		expect(store).toStrictEqual([
			{ date: 8 },
			{ date: 9 },
			{ date: 11 },
			{ date: 12 },
		]);
	});
});