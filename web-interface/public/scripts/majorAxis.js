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

const durationSecond = 1000,
	durationMinute = durationSecond * 60,
	durationHour = durationMinute * 60,
	durationDay = durationHour * 24,
	durationWeek = durationDay * 7,
	durationMonth = durationDay * 30,
	durationYear = durationDay * 365;

const tickIntervals = [
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
	[  timeWeek,  4,   timeWeek,  1,      durationWeek  ],
	[ timeMonth,  3,  timeMonth,  1,      durationMonth ],
	[  timeYear,  1,  timeMonth,  3,  3 * durationMonth ],
	[  timeYear,  1,   timeYear,  1,      durationYear  ]
];

// this is a copy of https://github.com/d3/d3-scale/blob/1e35c71c80def6b500b5a498540f3eb75eb59638/src/time.js#L69
// except using an updated tickIntervals array that gives major intervals
export function getMajorTickInterval(min, max) {
	// the target interval from the tickIntervals[4] array above
	const target = (max - min) / 10;

	const tickIntervalIndex = bisector(i => i[4]).right(tickIntervals, target);

	if (tickIntervalIndex === tickIntervals.length) {
		// if each tick is more than a year, just do what the defaul does (our chart doesn't zoom that far)
		const step = tickStep(min / durationYear, max / durationYear, 10);
		return timeYear.every(step);
	} else if (tickIntervalIndex) {
		// find the closest interval
		const upperTickInterval = tickIntervals[tickIntervalIndex];
		const lowerTickInterval = tickIntervals[tickIntervalIndex - 1];

		const tickInterval = target / lowerTickInterval[4] < upperTickInterval[4] / target
			? lowerTickInterval
			: upperTickInterval;

		const step = tickInterval[1];
		const interval = tickInterval[0];
		
		return interval
			.every(step);
	} else {
		// if less than a second, just return a second (our chart doesn't zoom that far)
		return timeSecond;
	}
}

export default function applyMajorTickClasses(innerAxis) {
	const axis = selection => {
		selection.call(innerAxis);

		const domain = innerAxis.scale().domain();

		const ticks = getMajorTickInterval(domain[0].getTime(), domain[1].getTime())
			.range(...domain)
			.map(date => date.getTime());

		selection.selectAll('.tick')
			.classed('major', date => ticks.includes(date.getTime()));
	};

	// should really set all the other axis api methods here
	axis.scale = (scale) => {
		if (scale) {
			innerAxis.scale(scale);
			return axis;
		} else {
			return innerAxis.scale();
		}
	};

	return axis;
}