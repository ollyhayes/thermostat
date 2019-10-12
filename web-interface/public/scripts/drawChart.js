import { select, event as d3Event} from 'd3-selection';
import 'd3-transition';
import { scaleTime, scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { zoom as d3Zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { timeDay } from 'd3-time';
import { interpolate } from 'd3-interpolate';
import { easeCubic } from 'd3-ease';

import multiFormat from './time-format';
import {getZoomExtent, getLimits, cropEase} from './utils';
import applyMajorTickClasses from './majorAxis';
import ticker from './ticker';
import {thermometers} from '../../../common/config.json';
import {createSaver, parseHash} from './domain-save';

const thermometerColours = thermometers.reduce((colours, {colour, id}) => ({
	...colours,
	[id]: colour
}),{});

function initialise(element, initialMinDate, initialMaxDate, minDate, maxDate) {
	const box = {
		x0: 0,
		x1: 1200,
		y0: 0,
		y1: 600
	};
	const margin = {
		left: 50,
		right: 50,
		top: 20,
		bottom: 30
	};

	box.width = box.x1 - box.x0;
	box.height = box.y1 - box.y0;
	const width = box.width - margin.left - margin.right;
	const height = box.height - margin.top - margin.bottom;

	const xScale = scaleTime()
		.domain([initialMinDate, initialMaxDate])
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
			.tickFormat(multiFormat)
			.tickSizeInner(4));
	const xAxisGrid = ticker(xScale, height);

	const yAxis = axisLeft(yScale)
		.tickSizeInner(4);
	const yAxisRight = axisRight(yScale)
		.tickSizeInner(4);
	const yAxisGrid = axisLeft(yScale)
		.tickFormat('')
		.tickSize(-width)
		.tickSizeOuter(0);

	const gYGrid = g.append('g')
		.classed('grid', true)
		.call(yAxisGrid);
	const gXGrid = g.append('g')
		.classed('grid', true)
		.call(xAxisGrid);

	const chartArea = g.append('g');
	
	g.append('rect')
		.classed('chart-clipper', true)
		.attr('x', -10000)
		.attr('y', -10000)
		.attr('width', 10000)
		.attr('height', 20000);
	g.append('rect')
		.classed('chart-clipper', true)
		.attr('x', width)
		.attr('y', -10000)
		.attr('width', 10000)
		.attr('height', 20000);

	const gXAxis = g.append('g')
		.attr('transform', `translate(0, ${height})`)
		.classed('axis', true)
		.call(xAxis);
	const gYAxis = g.append('g')
		.classed('axis', true)
		.call(yAxis);
	const gYAxisRight = g.append('g')
		.classed('axis', true)
		.attr('transform', `translate(${width}, 0)`)
		.call(yAxisRight);

	const zoom = d3Zoom()
		.interpolate(interpolate)
		.extent([[0,0],[width, height]])
		.translateExtent([[xScale(minDate), 0], [xScale(maxDate), 1]])
		.scaleExtent(getZoomExtent(xScale, ...xScale.domain(), minDate, maxDate));

	const zoomRect = g.append('rect')
		.attr('width', width)
		.attr('height', height)
		.attr('opacity', '0.0001')
		.call(zoom);

	return {
		lineGenerator,
		xScale, yScale,
		redrawXAxis(scale = xScale) {
			gXAxis.call(xAxis.scale(scale));
			gXGrid.call(xAxisGrid.scale(scale));
		},
		redrawYAxis(scale = yScale) {
			gYAxis.call(yAxis.scale(scale));
			gYAxisRight.call(yAxisRight.scale(scale));
			gYGrid.call(yAxisGrid.scale(scale));
		},
		chartArea,
		zoom, zoomRect
	};
}

export default async function drawChart(element, requestData) {
	const {minDate: minDateLimit, maxDate: maxDateLimit} = await getLimits();
	const minDate = timeDay(minDateLimit);
	const maxDate = timeDay.ceil(maxDateLimit);

	const defaultMinDate = timeDay(maxDate - 1);
	const defaultMaxDate = timeDay.ceil(new Date(defaultMinDate.getTime() + 1));
	const initialDomain = parseHash();
	const [initialMinDate, initialMaxDate] = initialDomain || [defaultMinDate, defaultMaxDate];

	const {
		lineGenerator,
		xScale, yScale,
		redrawXAxis, redrawYAxis,
		chartArea,
		zoom, zoomRect
	} = initialise(element, initialMinDate, initialMaxDate, minDate, maxDate);

	let zoomedScale = xScale;

	zoom.on('zoom', handleZoom);
	drawGraphs(true);

	let transitionDomain;
	let transitionT;
	let disableSave = false;
	const saveDomain = createSaver(zoomedScale.domain(), newDomain => {
		transitionDomain = newDomain || [defaultMinDate, defaultMaxDate];
		transitionT = 0;
		transitionToLocation();
	});

	let liveUpdate = false;
	document.addEventListener('keydown', async e => {
		if (e.key === 'f') {
			liveUpdate = !liveUpdate;
			if (liveUpdate)
				tick();
		}
	});

	return drawGraphs;

	function tick() {
		const centerOfScreen = 550;
		const positionOfNow = zoomedScale(new Date());
		zoom.translateBy(zoomRect, centerOfScreen - positionOfNow, 0);

		if (liveUpdate)
			requestAnimationFrame(tick);
	}

	function transitionToLocation() {
		if (!transitionDomain || transitionT === 1)
			return;

		const newDomain = transitionDomain;
		const oldTransform = zoomTransform(zoomRect.node());
		// we could reset the zoom first, instead of transforming these points. This is better though
		const oldRange = zoomedScale.range().map(oldTransform.invertX, oldTransform);
		const newRange = newDomain.map(zoomedScale).map(oldTransform.invertX, oldTransform);

		const scale = (oldRange[1] - oldRange[0]) / (newRange[1] - newRange[0]);
		const translate = oldRange[0] - scale * newRange[0]; // from x′ = (x-t)/k

		const transform = oldTransform.translate(translate, 0).scale(scale);

		disableSave = true;
		zoomRect
			.transition()
			.duration(500 * (1 - transitionT))
			.ease(cropEase(easeCubic, transitionT))
			.tween('custom', () => t => transitionT = t)
			.on('end', () => disableSave = false)
			.call(zoom.transform, transform);
	}

	function handleZoom() {
		const t = d3Event.transform;
		chartArea.attr('transform', `translate(${t.x} 0) scale(${t.k}, 1)`);
		zoomedScale = t.rescaleX(xScale);
		redrawXAxis(zoomedScale);

		if (!disableSave)
			saveDomain(zoomedScale.domain());

		const zoomChanged = t.k < 0.67 || t.k > 1.5;

		if (zoomChanged) // if the zoom changes a lot, reset the zoom so the svgs don't get all scaley
			resetZoom();

		if (zoomChanged || t.x < -1 || t.x > 1)
			drawGraphs();
	}

	function resetZoom() {
		// reset the zoom (without zooming)
		zoom.on('zoom', null);
		zoomRect.call(zoom.transform, zoomIdentity);
		zoom.on('zoom', handleZoom);

		// reset the graph position
		xScale.domain(zoomedScale.domain());
		zoomedScale = xScale;
		chartArea.attr('transform', null);

		// set extents
		zoom.translateExtent([[xScale(minDate), 0], [xScale(maxDate), 1]])
			.scaleExtent(getZoomExtent(xScale, ...xScale.domain(), minDate, maxDate));

		// if we're currently transitioning, continue the transition
		transitionToLocation();
	}

	function drawGraphs() {
		const data = requestData(zoomedScale.domain());

		// data is a list of thermometers, each with a list readings

		// reset the y-scale
		// be nice to have a better equality here
		// also to do this asynchronously after a bit of time so we only do it once
		// const yScaleUpdated = minTemperature !== yScale.domain()[0] || maxTemperature !== yScale.domain()[1];
		// if (yScaleUpdated) {
		// 	yScale.domain([minTemperature, maxTemperature]);
		// 	redrawYAxis();
		// }

		// set the paths
		chartArea
			.selectAll('path')
			.data(data, d => d.key)
			.join(
				enter => enter
					.append('path')
					.attr('fill', 'none')
					.attr('stroke', d => thermometerColours[d.thermometerId]))
			.attr('d', d => lineGenerator(d.temperatures));
	}
}