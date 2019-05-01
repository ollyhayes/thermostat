import { select, event as d3Event} from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';

import {
	timeSecond,
	timeMinute,
	timeHour,
	timeDay,
	timeWeek,
	timeMonth,
	timeYear
} from 'd3-time';
import {bisector, tickStep} from 'd3-array';

import multiFormat from './time-format';
import getTemperatureRaw, { getLimits, getTemperatureExtent } from './data-repository';
import throttler from './throttler';
import {autoRefresh} from '../../../common/config.json';

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

		//-----wrap in func-----
	const durationSecond = 1000,
		durationMinute = durationSecond * 60,
		durationHour = durationMinute * 60,
		durationDay = durationHour * 24,
		durationWeek = durationDay * 7,
		durationMonth = durationDay * 30,
		durationYear = durationDay * 365;

	// const tickIntervals = [
	// 	[timeSecond,  1,      durationSecond],
	// 	[timeSecond, 30, 30 * durationSecond],
	// 	[timeMinute,  1,      durationMinute],
	// 	[timeMinute, 15, 15 * durationMinute],
	// 	[  timeHour,  1,      durationHour  ],
	// 	[  timeHour,  6,  6 * durationHour  ],
	// 	[   timeDay,  1,      durationDay   ],
	// 	[  timeWeek,  1,      durationWeek  ],
	// 	[ timeMonth,  1,      durationMonth ],
	// 	[ timeMonth,  1,  3 * durationMonth ],
	// 	[  timeYear,  1,      durationYear  ]
	// ];

	var tickIntervals = [
		[timeSecond, 30, timeSecond,  1,      durationSecond],
		[timeSecond, 30, timeSecond,  5,  5 * durationSecond],
		[timeMinute,  1, timeSecond, 15, 15 * durationSecond],
		[timeMinute,  1, timeSecond, 30, 30 * durationSecond],
		[timeMinute, 15, timeMinute,  1,      durationMinute],
		[timeMinute, 30, timeMinute,  5,  5 * durationMinute],
		[  timeHour,  1, timeMinute, 15, 15 * durationMinute],
		[  timeHour,  1, timeMinute, 30, 30 * durationMinute],
		[  timeHour,  6,   timeHour,  1,      durationHour  ],
		[   timeDay,  1,   timeHour,  3,  3 * durationHour  ],
		[   timeDay,  1,   timeHour,  6,  6 * durationHour  ],
		[   timeDay,  1,   timeHour, 12, 12 * durationHour  ],
		[  timeWeek,  1,    timeDay,  1,      durationDay   ],
		[  timeWeek,  1,    timeDay,  2,  2 * durationDay   ],
		[ timeMonth,  1,   timeWeek,  1,      durationWeek  ],
		[ timeMonth,  3,  timeMonth,  1,      durationMonth ],
		[  timeYear,  1,  timeMonth,  3,  3 * durationMonth ],
		[  timeYear,  1,   timeYear,  1,      durationYear  ]
	];

	const xAxis = selection => {
		selection.call(xAxisa);

		const domain = xAxis.scale().domain();
		const width = (domain[1].getTime() - domain[0].getTime()) / 10;

		const tickIntervalIndex = bisector(i => i[4]).right(tickIntervals, width);
		// const otherIndexa = bisector(i => i[2]).right(otherIndex, width);

		// console.log(`${tickIntervalIndex}, ${otherIndexa}`);

		let ticks;

		if (tickIntervalIndex === tickIntervals.length) {
			const step = tickStep(domain[0].getTime() / durationYear, domain[1].getTime() / durationYear, 10);
			ticks = timeYear.every(step);
		} else if (tickIntervalIndex) {
			const currentTickInterval = tickIntervals[tickIntervalIndex];
			const previousTickInterval = tickIntervals[tickIntervalIndex - 1];

			const tickInterval = width / previousTickInterval[4] < currentTickInterval[4] / width
				? previousTickInterval
				: currentTickInterval;
			const step = tickInterval[1];
			const interval = tickInterval[0];
			
			ticks = interval
				.every(step);
		} else {
			ticks = timeSecond;
		}

		const ticks2 = ticks
			.range(...domain)
			.map(date => date.getTime());


		// do it like this, but use bisect, like on https://github.com/d3/d3-scale/blob/master/src/time.js#L40
		// const width = (domain[1].getTime() - domain[0].getTime()) / 1000;
		// const majorUnit = width < 1 ? timeSecond
		// 	: width < 60 ? timeMinute
		// 	: width < 3600 ? timeHour
		// 	: width < 86400 ? timeDay
		// 	: width < 604800 ? timeWeek
		// 	: width < 2419200 ? timeMonth
		// 	: timeYear;

		console.log(`Using major ticks of ${ticks}`);
			
		// console.log(domain);

		selection.selectAll('.tick')
			.classed('major', date => ticks2.includes(date.getTime()));
	};
	xAxis.scale = (scale) => {
		if (scale) {
			xAxisa.scale(scale);
			return xAxis;
		} else {
			return xAxisa.scale();
		}
	};
		//----------------------

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
