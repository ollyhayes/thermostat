import { select, event as d3Event} from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';

import multiFormat from './time-format';
import getTemperatureRaw, { getLimits, getTemperatureExtent, getZoomExtent } from './data-repository';
import throttler, {throttleTime} from './throttler';
import {autoRefresh} from '../../../common/config.json';
import applyMajorTickClasses from './majorAxis';

const getTemperature = throttler(getTemperatureRaw);

function initialise(element, minDate, maxDate, handleZoom) {
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

	const xScale = scaleTime()
		.domain([minDate, maxDate])
		.rangeRound([0, width]);

	const yScale = scaleLinear()
		.domain([10, 20])
		.rangeRound([height, 0]);

	const lineGenerator = line()
		.x(d => xScale(d.date))
		.y(d => yScale(d.temperature));

	const svg = select(element)
		.append('svg')
		.attr('viewBox', `${box.x0} ${box.y0} ${box.width} ${box.height}`);

	const g = svg
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	const xAxis = applyMajorTickClasses(
		axisBottom(xScale)
			.tickFormat(multiFormat));

	const xAxisGrid = applyMajorTickClasses(
		axisBottom(xScale)
			.tickFormat('')
			.tickSize(-height)
			.tickSizeOuter(0));

	const yAxis = axisLeft(yScale);
	const yAxisGrid = axisLeft(yScale)
		.tickFormat('')
		.tickSize(-width)
		.tickSizeOuter(0);

	const gYGrid = g.append('g')
		.classed('grid', true)
		.call(yAxisGrid);
	const gXGrid = g.append('g')
		.attr('transform', `translate(0, ${height})`)
		.classed('grid', true)
		.call(xAxisGrid);

	const chartArea = g.append('g');
	
	g.append('rect')
		.classed('chart-clipper', true)
		.attr('x', -margin.left)
		.attr('width', margin.left)
		.attr('height', height);

	const gXAxis = g.append('g')
		.attr('transform', `translate(0, ${height})`)
		.classed('axis', true)
		.call(xAxis);
	const gYAxis = g.append('g')
		.classed('axis', true)
		.call(yAxis);

	const zoom = d3Zoom()
		.translateExtent([[xScale(minDate), 0], [xScale(maxDate), 1]])
		.scaleExtent(getZoomExtent(xScale, minDate, maxDate, minDate, maxDate));

	const zoomRect = g.append('rect')
		.attr('width', width)
		.attr('height', height)
		.attr('opacity', '0')
		.call(zoom
			.translateExtent([[xScale(minDate), 0], [xScale(maxDate), 1]])
			.on('zoom', handleZoom));

	return {
		lineGenerator,
		xScale, yScale,
		redrawXAxis(scale = xScale) {
			gXAxis.call(xAxis.scale(scale));
			gXGrid.call(xAxisGrid.scale(scale));
		},
		redrawYAxis(scale = yScale) {
			gYAxis.call(yAxis.scale(scale));
			gYGrid.call(yAxisGrid.scale(scale));
		},
		chartArea,
		zoom, zoomRect
	};
}

export default async function drawChart(element) {
	const {minDate, maxDate} = autoRefresh
		? {minDate: new Date(Date.now() - 30000), maxDate: new Date(Date.now() + 30000)}
		: (await getLimits());

	const {
		lineGenerator,
		xScale, yScale,
		redrawXAxis, redrawYAxis,
		chartArea,
		zoom, zoomRect
	} = initialise(element, minDate, maxDate, handleZoom);

	let zoomedScale = xScale;
	const triggerReload = throttleTime(reloadRaw, 1000);
	triggerReload(minDate, maxDate);

	function handleZoom() {
		const t = d3Event.transform;
		chartArea.attr('transform', `translate(${t.x} 0) scale(${t.k}, 1)`);
		zoomedScale = t.rescaleX(xScale);
		redrawXAxis(zoomedScale);

		triggerReload();
	}

	document.addEventListener('keydown', async e => {
		if (e.key === 'Enter')
			await triggerReload();
	});

	if (autoRefresh)
		setInterval(() => triggerReload(minDate, new Date(Date.now() + 30000)) , 2000);

	async function reloadRaw(startDate = null, endDate = null) {
		if (!startDate || !endDate)
			[startDate, endDate] = zoomedScale.domain();

		const data = await getTemperature(startDate, endDate);

		// reset the y-scale
		yScale.domain(getTemperatureExtent(data));
		redrawYAxis();

		// reset the zoom (without zooming)
		zoom.on('zoom', null);
		zoomRect.call(zoom.transform, zoomIdentity);
		zoom.on('zoom', handleZoom);

		// reset the graph position
		xScale.domain(zoomedScale.domain());
		zoomedScale = xScale;
		chartArea.attr('transform', null);
		redrawYAxis();

		// set extents
		zoom.translateExtent([[xScale(minDate), 0], [xScale(maxDate), 1]])
			.scaleExtent(getZoomExtent(xScale, startDate, endDate, minDate, maxDate));

		// set the paths
		chartArea
			.selectAll('path')
			.data(data, d => d.key)
			.join(
				enter => enter.append('path').attr('fill', 'none').attr('stroke', d => d.colour).attr('d', d => lineGenerator(d.values)),
				update => update.attr('d', d => lineGenerator(d.values)));
	}
}