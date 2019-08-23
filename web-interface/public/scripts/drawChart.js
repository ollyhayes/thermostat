import { select, event as d3Event} from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';
import { timeDay } from 'd3-time';

import multiFormat from './time-format';
import DataWorker from './data.worker.js';
import {getZoomExtent, getLimits} from './utils';
import applyMajorTickClasses from './majorAxis';
import ticker from './ticker';
import createChunkStore from './chunk-store';
import {thermometers} from '../../../common/config.json';
import {
	flattenChunks,
	getChunksForDateRange,
	createChunksChangedCalculator
} from './chunk-utils';
import {createSaver} from './domain-save';

const dataWorker = new DataWorker();

const thermometerColours = thermometers.reduce((colours, {colour, id}) => ({
	...colours,
	[id]: colour
}),{});

function initialise(element, initialMinDate, initialMaxDate, minDate, maxDate, handleZoom) {
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
		.attr('x', -margin.left)
		.attr('width', margin.left)
		.attr('height', height);
	g.append('rect')
		.classed('chart-clipper', true)
		.attr('x', width)
		.attr('width', margin.right)
		.attr('height', height);

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
		.extent([[0,0],[width, height]])
		.translateExtent([[xScale(minDate), 0], [xScale(maxDate), 1]])
		.scaleExtent(getZoomExtent(xScale, ...xScale.domain(), minDate, maxDate));

	const zoomRect = g.append('rect')
		.attr('width', width)
		.attr('height', height)
		.attr('opacity', '0.0001')
		.call(zoom
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
			gYAxisRight.call(yAxisRight.scale(scale));
			gYGrid.call(yAxisGrid.scale(scale));
		},
		chartArea,
		zoom, zoomRect
	};
}

export default async function drawChart(element) {
	const {minDate: minDateLimit, maxDate: maxDateLimit} = await getLimits();
	const minDate = timeDay(minDateLimit);
	const maxDate = timeDay.ceil(maxDateLimit);

	// const initialMinDate = timeDay(new Date(2019, 5, 0));
	const initialMinDate = timeDay(maxDate);
	const initialMaxDate = timeDay.ceil(new Date(initialMinDate.getTime() + 1));

	const {
		lineGenerator,
		xScale, yScale,
		redrawXAxis, redrawYAxis,
		chartArea,
		zoom, zoomRect
	} = initialise(element, initialMinDate, initialMaxDate, minDate, maxDate, handleZoom);

	let zoomedScale = xScale;
	const {getChunks: getChunkData, storeChunk, getMissingChunks} = createChunkStore();

	const chunksChanged = createChunksChangedCalculator();

	dataWorker.addEventListener('message', handleNewData);
	render(false);

	// fix this
	let disableSave = false;

	const saveDomain = createSaver(zoomedScale.domain(), newDomain => {

		const oldRange = zoomedScale.range();
		const newRange = newDomain.map(zoomedScale);

		// const scale = (oldRange[1] - oldRange[0]) / (newRange[1] - newRange[0]);
		// const scaleTransform = zoomIdentity.scale(scale);
		// const newRangeScaled = newRange.map(p => scaleTransform.invertX(p));

		// const translate = newRangeScaled[0] - oldRange[0];
		const translate = newRange[0] - oldRange[0];
		console.log(`translating to: ${newDomain[0]}, by: ${translate}`);

		const transform = zoomIdentity.translate(-translate, 0);

		disableSave = true;
		zoomRect.call(zoom.transform, transform); // something wierd happening in here...
		disableSave = false;
	});

	function handleZoom() {
		const t = d3Event.transform;
		chartArea.attr('transform', `translate(${t.x} 0) scale(${t.k}, 1)`);
		zoomedScale = t.rescaleX(xScale);
		redrawXAxis(zoomedScale);

		if (!disableSave)
			saveDomain(zoomedScale.domain());

		render(t.k < 0.67 || t.k > 1.5);
	}

	function render(zoomChanged) {
		const chunksInView = getChunksForDateRange(...zoomedScale.domain());
		const chunksHaveChanged = chunksChanged(chunksInView);

		if (chunksHaveChanged) { // tell the server we need new chunks
			const missingChunks = getMissingChunks(chunksInView);
			if (missingChunks.length > 0)
				dataWorker.postMessage(missingChunks);
		}

		if (zoomChanged) // if the zoom changes a lot, reset the zoom so the svgs don't get all scaley
			resetZoom();

		if (zoomChanged || chunksHaveChanged) // if the current view has changed, or we've zoomed, draw new/all graphs
			drawGraphs(chunksInView, zoomChanged);
	}

	function handleNewData({data: chunk}) {
		storeChunk(chunk);

		// also need to allow autoupdate to work again

		drawGraphs(getChunksForDateRange(...zoomedScale.domain()), false);
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
	}

	function drawGraphs(chunks, redrawExistingGraphs) {
		const {thermometerReadings, minTemperature, maxTemperature} = 
			flattenChunks(getChunkData(chunks));

		// reset the y-scale
		// be nice to have a better equality here
		// also to do this asynchronously after a bit of time so we only do it once
		const yScaleUpdated = minTemperature !== yScale.domain()[0] || maxTemperature !== yScale.domain()[1];
		if (yScaleUpdated) {
			yScale.domain([minTemperature, maxTemperature]);
			redrawYAxis();
		}

		// set the paths
		chartArea
			.selectAll('path')
			.data(thermometerReadings, d => d.key)
			.join(
				enter => enter
					.append('path')
					.attr('fill', 'none')
					.attr('stroke', d => thermometerColours[d.thermometerId])
					.attr('d', d => lineGenerator(d.temperatures)),
				update => yScaleUpdated || redrawExistingGraphs
					? update.attr('d', d => lineGenerator(d.temperatures))
					: update);
	}
}