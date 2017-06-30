import { select } from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { extent, range } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import getTemperature from "./data-repository";

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
	
	const startDate = new Date(2017, 5, 26);
	const endDate = new Date(2017, 5, 27);
	// const startDate = new Date(2017, 5, 26, 17, 0);
	// const endDate = new Date(2017, 5, 26, 18, 0);
	const data = await getTemperature(startDate, endDate);

	const getTemperatureForDate = time =>
	{
		let currentTemperature = data[0].temperature;
		for (let i = 0; i < data.length; i++)
		{
			if (data[i].date.getTime() / 1000 > time)
				break;

			currentTemperature = data[i].temperature;
		}

		return currentTemperature;
	};

	const spreadData = range(startDate.getTime() / 1000, endDate.getTime() / 1000)
		.map(time => ({
			date: new Date(time * 1000),
			temperature: getTemperatureForDate(time)
		}));

	const search = 60;
	const averagedData = spreadData.map((dataPoint, index) =>
	{
		const min = Math.max(index - search, 0);
		const max = Math.min(index + search, spreadData.length - 1);

		let sum = 0;
		for (let i = min; i < max; i++)
			sum += spreadData[i].temperature;

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
		.call(axisBottom(xScale));

	g.append("g")
		.classed("axis", true)
		.call(axisLeft(yScale));

	// g.append("path")
	// 	.datum(data)
	// 	.attr("fill", "none")
	// 	.attr("stroke", "steelblue")
	// 	.attr("d", lineGenerator);

	// g.append("path")
	// 	.datum(spreadData)
	// 	.attr("fill", "none")
	// 	.attr("stroke", "red")
	// 	.attr("d", lineGenerator);

	g.append("path")
		.datum(averagedData)
		.attr("fill", "none")
		.attr("stroke", "yellow")
		.attr("d", lineGenerator);
}
