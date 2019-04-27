import ajax from './ajax';
import config from '../../../common/config.json';
import { nest as d3Nest } from 'd3-collection';

const thermometerColours = config.reduce((colours, {colour, id}) => ({
	...colours,
	[id]: colour
}),{});

const nest = d3Nest()
	.key(d => d.id);

export default async function getTemperature(minDate, maxDate)
{
	const min = minDate.getTime();
	const max = maxDate.getTime();

	const minuteLimit = (max - min) / (1000 * 60); // how many minutes are we looking at
	// const precisionLevel = minuteLimit > 500 // more than five hundred, maybe adjust? also hours!
	// 	? 1
	// 	: 0;

	const precisionLevel = 0;

	const data = await ajax(`/data?minDate=${min}&maxDate=${max}&precisionLevel=${precisionLevel}`);
	
	const parsedData = data.map(dataPoint => ({
		...dataPoint,
		date: new Date(dataPoint.date),
	}));

	const nestedData = nest.entries(parsedData)
		.map(({key, values}) => ({
			key,
			colour: thermometerColours[key],
			values
		}));

	return nestedData;
}

export async function getLimits() {
	const {minDate, maxDate} = await ajax('/limits');

	return {
		minDate: new Date(minDate),
		maxDate: new Date(maxDate)
	};
}