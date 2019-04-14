import { select, event as d3Event} from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { extent } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { zoom } from "d3-zoom";

import { getData } from "./utils";
import multiFormat from "./time-format";
import { relativeTimeRounding } from "moment";

const showRawData = false;

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

	// const startDate = new Date(2019, 2, 27, 12);
	// const endDate = new Date(2019, 2, 27, 12, 30);
	const startDate = new Date(Date.now() - 30000);
	const endDate = new Date(Date.now() + 30000);

	const {data, rawData} = await getData(startDate, endDate);

	const xScale = scaleTime()
		.domain(extent(data, d => d.date))
		.rangeRound([0, width]);

	const yScale = scaleLinear()
		.domain(getYAxisExtent(data))
		.rangeRound([height, 0]);

	const worldExtent = [[new Date(2019, 2, 20), 20], [new Date(2019, 2, 30), 10]];
	const translatedWorldExtent = [
		[xScale(worldExtent[0][0]), yScale(worldExtent[0][1])],
		[xScale(worldExtent[1][0]), yScale(worldExtent[1][1])]
	];
	
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
			// .scaleExtent([1, Infinity])
			// .translateExtent(translatedWorldExtent)
			.on("zoom", zoomed));

	const rawPath = showRawData
		? chartArea.append("path")
			.datum(rawData)
			.attr("fill", "none")
			.attr("stroke", "black")
			.attr("d", lineGenerator)
		: null;

	const path = chartArea.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "yellow")
		.attr("d", lineGenerator);

	let zoomedScale = xScale;

	function zoomed() {
		const t = d3Event.transform;
		chartArea.attr("transform", `translate(${t.x} 0) scale(${t.k}, 1)`);
		zoomedScale = t.rescaleX(xScale);
		gX.call(xAxis.scale(zoomedScale));
		// gY.call(yAxis.scale(t.rescaleY(yScale)));
	}

	async function reload(startDate, endDate) {
		const {data, rawData} = await getData(startDate, endDate);

		yScale.domain(getYAxisExtent(data));
		gY.call(yAxis);

		path.datum(data)
			.attr("d", lineGenerator);

		if (showRawData)
			rawPath.datum(rawData)
				.attr("d", lineGenerator);
	}

	document.addEventListener("keydown", async e => {
		if (e.key === "Enter") {
			const [startDate, endDate] = zoomedScale.domain();

			await reload(startDate, endDate);
		}
	});

	setInterval(() => {
		const startDate = new Date(Date.now() - 30000);
		const endDate = new Date(Date.now() + 30000);

		reload(startDate, endDate);
	}, 1000);

	function getYAxisExtent(data) {
		const [minTemperature, maxTemperature] = extent(data, d => d.temperature);

		if (maxTemperature - minTemperature < 1) {
			const midPoint = (maxTemperature + minTemperature) / 2;
			return [midPoint - 0.5, midPoint + 0.5];
		}

		return [minTemperature, maxTemperature];
	}
}

// todo:
// make it load as you scroll
// fix the end