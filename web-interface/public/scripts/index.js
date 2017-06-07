import { select } from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { extent } from "d3-array";
import "../less/page.less"; // this should be moved up to an entry point

document.addEventListener("DOMContentLoaded", () =>
{
	const box = {
		x0: 0,
		x1: 1000,
		y0: 0,
		y1: 1000
	};
	const margin = {
		left: 20,
		right: 20,
		top: 20,
		bottom: 20
	};
	box.width = box.x1 - box.x0;
	box.height = box.y1 - box.y0;
	const width = box.width - margin.left - margin.right;
	const height = box.height - margin.top - margin.bottom;

	const dates = [new Date(), new Date(), new Date(), new Date()];
	dates.forEach((date, index) => date.setMonth(index + 2));
	const data = dates.map(date => ({date: date, value: Math.random()}));

	const g = select("svg")
		.attr("viewBox", `${box.x0} ${box.y0} ${box.width} ${box.height}`)
		.append("g")
			.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const xScale = scaleTime()
		.domain(extent(data, d => d.date))
		.rangeRound([0, width]);

	const yScale = scaleLinear()
		.domain(extent(data, d => d.value))
		.rangeRound([height, 0]);
		
	const lineGenerator = line()
		.x(d => xScale(d.date))
		.y(d => yScale(d.value));

	g.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", lineGenerator);

	// g.append("line")
	// 	.attr("x2", box.width)
	// 	.attr("y2", box.height);
});
