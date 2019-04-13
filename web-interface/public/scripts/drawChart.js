import { select } from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { extent, range } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";

import getTemperature from "./data-repository";
import multiFormat from "./time-format";

export default async function drawChart(element)
{
	const box = {
		x0: 0,
		x1: 1200,
		y0: 0,
		y1: 600
	};
	const margin = {
		left: 50,
		right: 20,
		top: 20,
		bottom: 30
	};

	box.width = box.x1 - box.x0;
	box.height = box.y1 - box.y0;
	const width = box.width - margin.left - margin.right;
	const height = box.height - margin.top - margin.bottom;
	
	const startDate = new Date(2019, 2, 27, 12);
	const endDate = new Date(2019, 2, 27, 15, 30);

	const data = await getTemperature(startDate, endDate);

	// const indexed = data.reduce((map, next, i) => {
	// 	map[new Date(next.date).getTime() / 1000] = i;
	// 	return map;
	// }, {});

	// const getTemperatureForDate = time =>
	// {
	// 	let currentTemperature = data[0].temperature;
	// 	for (let i = 0; i < data.length; i++)
	// 	{
	// 		if (data[i].date.getTime() / 1000 > time)
	// 			break;

	// 		currentTemperature = data[i].temperature;
	// 	}

	// 	return currentTemperature;
	// };
	
	// function* nextTime(startDate, endDate, step = 1) {
	// 	let currentPosition = 0;
	// 	for (let date = startDate; startDate < endDate; startDate += step) {
	// 		for (let currentIndex = currentPosition; currentIndex < data.length; currentIndex++) {

	// 			if (data[currentIndex].date.getTime() / 1000 > date)
	// 				yield data[currentIndex];

	// 		}
	// 	}
	// }

	// const indexed = new Map();
	const spread = [];
	{
		let start = startDate.getTime() / 1000;
		let end =  endDate.getTime() / 1000;
		let currentIndex = 0;
		let step = 1; // vary this based on window size

		for (let date = start; date < end; date += step) {
			for (; currentIndex < data.length; currentIndex++) {

				if (data[currentIndex].date.getTime() / 1000 > date) {
					// indexed.set(date, data[currentIndex]);
					spread.push(data[currentIndex]);
					break;
				}
					
			}
		}
	}

	// const spreadData = range(startDate.getTime() / 1000, endDate.getTime() / 1000)
	// 	// .filter(time => time % 10 === 0)
	// 	.map(time => ({
	// 		date: new Date(time * 1000),
	// 		temperature: indexed[time]
	// 	}));

	const search = 6;
	const averagedData = spread.map((dataPoint, index) =>
	{
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

	const g = select(element)
		.append("svg")
		.attr("viewBox", `${box.x0} ${box.y0} ${box.width} ${box.height}`)
		.append("g")
			.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const xScale = scaleTime()
		.domain(extent(data, d => d.date))
		.rangeRound([0, width]);

	const yScale = scaleLinear()
		.domain(extent(data, d => d.temperature))
		.rangeRound([height, 0]);

	const lineGenerator = line()
		.x(d => xScale(d.date))
		.y(d => yScale(d.temperature));

	g.append("g")
		.classed("axis", true)
		.attr("transform", `translate(0, ${height})`)
		.call(axisBottom(xScale)
			.tickFormat(multiFormat));

	g.append("g")
		.classed("axis", true)
		.call(axisLeft(yScale));

	g.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "black")
		.attr("d", lineGenerator);

	g.append("path")
		.datum(averagedData)
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("d", lineGenerator);
}
