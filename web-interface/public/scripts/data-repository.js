import { nest as d3Nest } from 'd3-collection';
import { extent } from 'd3-array';

import ajax from './ajax';
import {thermometers} from '../../../common/config.json';
import log from '../../../common/log';

const thermometerColours = thermometers.reduce((colours, {colour, id}) => ({
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
	const hourLimit = minuteLimit / 60;
	const precisionLevel = hourLimit > 96
		? 2
		: minuteLimit > 100 // more than five hundred, maybe adjust? also hours!
			? 1
			: 0;
	
	const data = await ajax(`/data?minDate=${min}&maxDate=${max}&precisionLevel=${precisionLevel}`);

	//log(`Precision: ${precisionLevel}, Datapoints: ${data.length}`, 'green');
	
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

export function getTemperatureExtent(data) {
	const [minTemperature, maxTemperature] = extent(
		data.reduce((flat, next) => [...flat, ...next.values], []),
		d => d.temperature);
	const minWidth = 10;

	if (maxTemperature - minTemperature < minWidth) {
		const midPoint = (maxTemperature + minTemperature) / 2;
		return [midPoint - minWidth / 2, midPoint + minWidth / 2];
	}

	return [minTemperature - 3, maxTemperature + 3];
}

export function getZoomExtent(scale, currentMin, currentMax, absoluteMin, absoluteMax) {
	const minZoom = scale(new Date(10000)) - scale(new Date(0));
	const currentZoom = scale(currentMax) - scale(currentMin);
	const maxZoom = scale(absoluteMax) - scale(absoluteMin);
	
	return [[currentZoom / maxZoom], [currentZoom / minZoom]];
}