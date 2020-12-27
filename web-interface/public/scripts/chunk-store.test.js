// const { storeValues } = require('./chunk-store');
import {getValues, storeValues} from './chunk-store.js';

test('insert values into gap', async () => {
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

test('insert values before start', async () => {
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

test('insert values after end', async () => {
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

test('insert values before with overlap', async () => {
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

test('insert values in middle', async () => {
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

test('get values in the middle', async () => {
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

test('get values at the end', async () => {
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

test('get values at the start', async () => {
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