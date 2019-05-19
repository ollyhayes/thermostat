export default function ticker(scale, height) {
	const tickFunction = selection => {
		const ticks = scale.ticks();

		selection.selectAll('line')
			.data(ticks)
			.join(
				enter => enter
					.append('line')
					.attr('x1', d => scale(d))
					.attr('x2', d => scale(d))
					.attr('y1', 0)
					.attr('y2', height),
				update => update
					.attr('x1', d => scale(d))
					.attr('x2', d => scale(d))
					.attr('y1', 0)
					.attr('y2', height),
			);
	};

	tickFunction.scale = newScale => {
		scale = newScale;
		return tickFunction;
	};

	return tickFunction;
}