import { select, event as d3Event} from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { extent } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { zoom } from "d3-zoom";

import multiFormat from "./time-format";
import getTemperature from "./data-repository";

const autoRefresh = false;

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

	const [startDate, endDate] = autoRefresh
		? [new Date(Date.now() - 30000), new Date(Date.now() + 30000)]
		: [new Date(2019, 2, 27, 12), new Date(2019, 2, 27, 12, 30)];

	const data = await getTemperature(startDate, endDate);

	const xScale = scaleTime()
		.domain(extent(data, d => d.date))
		.rangeRound([0, width]);

	const yScale = scaleLinear()
		.domain(getYAxisExtent(data))
		.rangeRound([height, 0]);

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
		.call(zoom()
			.scaleExtent([1e-5, 100])
			.on("zoom", zoomed));

	const path = chartArea.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "yellow")
		.attr("d", lineGenerator);

	let zoomedScale = xScale;

	function zoomed() {
		const t = d3Event.transform;
		console.log(t.k);
		chartArea.attr("transform", `translate(${t.x} 0) scale(${t.k}, 1)`);
		zoomedScale = t.rescaleX(xScale);
		gX.call(xAxis.scale(zoomedScale));
		// gY.call(yAxis.scale(t.rescaleY(yScale)));
	}

	async function reload(startDate, endDate) {
		const data = await getTemperature(startDate, endDate);

		yScale.domain(getYAxisExtent(data));
		gY.call(yAxis);

		path.datum(data)
			.attr("d", lineGenerator);
	}

	document.addEventListener("keydown", async e => {
		if (e.key === "Enter") {
			const [startDate, endDate] = zoomedScale.domain();

			await reload(startDate, endDate);
		}
	});

	if (autoRefresh)
		setInterval(() => reload(startDate, new Date(Date.now() + 30000)) , 2000);

	function getYAxisExtent(data) {
		const [minTemperature, maxTemperature] = extent(data, d => d.temperature);
		const minWidth = 10;

		if (maxTemperature - minTemperature < minWidth) {
			const midPoint = (maxTemperature + minTemperature) / 2;
			return [midPoint - minWidth / 2, midPoint + minWidth / 2];
		}

		return [minTemperature, maxTemperature];
	}
}