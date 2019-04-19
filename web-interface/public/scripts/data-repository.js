import ajax from "./ajax";
import config from "../../../common/config.json";
import { nest as d3Nest } from "d3-collection";

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

	const data = await ajax(`/data?minDate=${min}&maxDate=${max}`);
	
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