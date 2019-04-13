import { select, event as d3Event} from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { extent } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { zoom } from "d3-zoom";

import { calculateAverage } from "./utils";
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
	const endDate = new Date(2019, 2, 27, 12, 30);

	const data = await getTemperature(startDate, endDate);
	const averagedData = calculateAverage(data, 10); // vary step by zoom

	const xScale = scaleTime()
		.domain(extent(data, d => d.date))
		.rangeRound([0, width]);

	const yScale = scaleLinear()
		.domain(extent(data, d => d.temperature))
		.rangeRound([height, 0]);

	const worldExtent = [[new Date(2019, 2, 20), 20], [new Date(2019, 2, 30), 10]];
	const translatedWorldExtent = [
		[xScale(worldExtent[0][0]), yScale(worldExtent[0][1])],
		[xScale(worldExtent[1][0]), yScale(worldExtent[1][1])]
	];
	
	const zoomer = zoom()
		// .scaleExtent([1, Infinity])
		.translateExtent(translatedWorldExtent)
		.on("zoom", zoomed);

	const lineGenerator = line()
		.x(d => xScale(d.date))
		.y(d => yScale(d.temperature));

	const g = select(element)
		.append("svg")
		.attr("viewBox", `${box.x0} ${box.y0} ${box.width} ${box.height}`)
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const xAxis = axisBottom(xScale)
		.tickFormat(multiFormat);
	const gX = g.append("g")
		.classed("axis", true)
		.attr("transform", `translate(0, ${height})`)
		.call(xAxis);

	const yAxis = axisLeft(yScale);
	const gY = g.append("g")
		.classed("axis", true)
		.call(yAxis);

	const chartArea = g.append("g");

	g.append("rect")
		.attr("width", width)
		.attr("height", height)
		.attr("opacity", "0")
		.call(zoomer);

	// g.append("path")
	// 	.datum(data)
	// 	.attr("fill", "none")
	// 	.attr("stroke", "black")
	// 	.attr("d", lineGenerator);

	chartArea.append("path")
		.datum(averagedData)
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("d", lineGenerator);

	function zoomed() {
		const t = d3Event.transform;
		chartArea.attr("transform", `translate(${t.x} 0) scale(${t.k}, 1)`);
		gX.call(xAxis.scale(t.rescaleX(xScale))); // think we need to reset xScale too!
		// gY.call(yAxis.scale(t.rescaleY(yScale)));
	}
}