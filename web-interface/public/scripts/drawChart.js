import { select, event as d3Event} from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';

import multiFormat from './time-format';
import getTemperatureRaw, { getLimits, getTemperatureExtent } from './data-repository';
import throttler from './throttler';
import {autoRefresh} from '../../../common/config.json';
import { gzip } from 'zlib';

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

	const g = select(element)
		.append('svg')
		.attr('viewBox', `${box.x0} ${box.y0} ${box.width} ${box.height}`)
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	const xAxisa = axisBottom(xScale)
		.tickFormat(multiFormat);

	const xAxis = selection => {
		selection.call(xAxisa);

		console.log('test');

		selection.selectAll('.tick')
			.classed('gay', true)
			.filter(date => {

				// fitlre in here we see if it's major,
			})
			.classed('major', true);
	};
	xAxis.scale = xAxisa.scale;

	const gX = g.append('g')
		.classed('axis', true)
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis);

	const yAxis = axisLeft(yScale);
	const gY = g.append('g')
		.classed('axis', true)
		.call(yAxis);

	const chartArea = g.append('g');
	const zoom = d3Zoom();

	const zoomRect = g.append('rect')
		.attr('width', width)
		.attr('height', height)
		.attr('opacity', '0')
		.call(zoom
			.scaleExtent([1e-5, 100])
			.on('zoom', handleZoom));

	return {
		lineGenerator,
		xScale, gX, xAxis,
		yScale, gY, yAxis,
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
		xScale, gX, xAxis,
		yScale, gY, yAxis,
		chartArea,
		zoom, zoomRect
	} = initialise(element, minDate, maxDate, handleZoom);

	reload(minDate, maxDate);

	let zoomedScale = xScale;

	function handleZoom() {
		const t = d3Event.transform;
		chartArea.attr('transform', `translate(${t.x} 0) scale(${t.k}, 1)`);
		zoomedScale = t.rescaleX(xScale);
		gX.call(xAxis.scale(zoomedScale));
	}

	async function reload(startDate, endDate) {
		const data = await getTemperature(startDate, endDate);

		// reset the y-scale
		yScale.domain(getTemperatureExtent(data));
		gY.call(yAxis);

		// reset the zoom (without zooming)
		zoom.on('zoom', null);
		zoomRect.call(zoom.transform, zoomIdentity);
		zoom.on('zoom', handleZoom);

		// reset the graph position
		xScale.domain(zoomedScale.domain());
		zoomedScale = xScale;
		chartArea.attr('transform', null);
		gX.call(xAxis.scale(xScale));

		// set the paths
		chartArea
			.selectAll('path')
			.data(data, d => d.key)
			.join(
				enter => enter.append('path').attr('fill', 'none').attr('stroke', d => d.colour).attr('d', d => lineGenerator(d.values)),
				update => update.attr('d', d => lineGenerator(d.values)));
	}

	document.addEventListener('keydown', async e => {
		if (e.key === 'Enter') {
			const [startDate, endDate] = zoomedScale.domain();

			await reload(startDate, endDate);
		}
	});

	if (autoRefresh)
		setInterval(() => reload(minDate, new Date(Date.now() + 30000)) , 2000);
}
