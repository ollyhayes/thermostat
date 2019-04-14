import { range } from "d3-array";
import getTemperature from "./data-repository";

const search = 20;//20; // pick a constant
const resolution = 100; // number of x-data points on screen

// move to web worker?
export function calculateAverage(data, step) {
	const startDate = data[0].date.getTime() / 1000;
	const endDate = data[data.length - 1].date.getTime() / 1000;
	let currentIndex = 0;

	const spread = range(startDate, endDate, step)
		.map(date => {
			for (; currentIndex < data.length; currentIndex++) {
				if (data[currentIndex].date.getTime() / 1000 > date)
					return data[currentIndex];
			}
			return data[data.length - 1];
		});

	return spread.map((dataPoint, index) => {
		const min = Math.max(index - search, 0);
		const max = Math.min(index + search, spread.length - 1);

		let sum = 0;
		for (let i = min; i < max; i++)
			sum += spread[i].temperature;

		return {
			date: dataPoint.date,
			temperature: sum / (max - min)
		};
	});
}

export async function getData(startDate, endDate) {
	const data = await getTemperature(startDate, endDate);
	const step = (endDate.getTime() - startDate.getTime()) / (1000 * resolution); // 1000 (seconds) * 1000 (resolution on screen)

	console.log(step);

	return {
		data: calculateAverage(data, Math.max(Math.round(step), 1)),
		rawData: data
	};
}