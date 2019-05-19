import {getMajorTickInterval} from './majorAxis';

export default function ticker(scale, height) {
	const tickFunction = selection => {
		const ticks = scale.ticks();
		const domain = scale.domain();
		const majorTicks  = getMajorTickInterval(domain[0].getTime(), domain[1].getTime())
			.range(...domain)
			.map(date => date.getTime());

		selection.selectAll('line')
			.data(ticks, d => d)
			.join(
				enter => enter
					.append('line')
					.attr('x1', d => scale(d))
					.attr('x2', d => scale(d))
					.attr('y1', 0)
					.attr('y2', height)
					.classed('major', d => majorTicks.includes(d.getTime())),
				update => update
					.attr('x1', d => scale(d))
					.attr('x2', d => scale(d))
					.attr('y1', 0)
					.attr('y2', height)
					.classed('major', d => majorTicks.includes(d.getTime()))
			);
	};

	tickFunction.scale = newScale => {
		scale = newScale;
		return tickFunction;
	};

	return tickFunction;
}