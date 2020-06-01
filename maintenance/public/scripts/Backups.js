import React, { useEffect, useState as useStateReact } from 'react';
import { useState } from './store';
import { line } from 'd3-shape';
import { scaleTime, scaleLinear } from 'd3';
import moment from 'moment';
import Panel from './Panel';

// const specifier = '%Y-%m-%d %H:%M:%S';
const formatTime = time => time && moment(time).format('Do MMM HH:mm');
// const formatTime = time => moment(time).format('Mo MMM YYYY HH:mm');

export default function Backups() {
	const {backups: {backups, error}} = useState();
	const [logToPreview, setLogToPreview] = useStateReact(null);

	function renderError() {
		return <div>
			{error
				? <span>Error loading data: {error}</span>
				: <span>Loading</span>}
		</div>;
	}

	function renderBackups() {
		return <>
			<table>
				<thead>
					<tr>
						<th>t<sub>0</sub></th>
						<th>t<sub>n</sub> - t<sub>0</sub></th>
						<th>n</th>
						<th>r<sub>max</sub></th>
						<th>s</th>
						<th className="graph">Graph</th>
					</tr>
				</thead>
				<tbody>
					{backups.map((log, index) =>
						<tr
							key={index}
							className={log === logToPreview ? 'selected' : ''}
							onClick={() => setLogToPreview(log === logToPreview ? null : log)}>
							<td>{formatTime(log.startTime)}</td>
							<td className="numeric">{moment.duration(moment(log.startTime).diff(log.endTime)).humanize()}</td>
							<td className="numeric">{log.requests.length}</td>
							<td className="numeric">{log.maxDuration / 1000 + 's'}</td>
							<td className="numeric">{formatSize(log.transferred)}</td>
							<td className="graph"><Chart log={log} aspectRatio={12}/></td>
						</tr>
					)}
				</tbody>
			</table>
			{logToPreview && renderGraphPreview(logToPreview)}
		</>;
	}

	function renderGraphPreview(log) {
		return <div className="chart-preview">
			<Chart log={log} aspectRatio={3}/>
		</div>;
	}

	return <Panel name="Backups" className="backups">
		{backups
			? renderBackups()
			: renderError()}
	</Panel>;
}

function Chart({log, aspectRatio}) {
	// eg 1920x1080, aR = 1.777
	// 1000x100, aR = 10
	const [data, setData] = useStateReact();
	useEffect(() => {
		const xScale = scaleTime()
			.domain([log.startTime, log.endTime])
			.range([0, 100 * aspectRatio]);
		const yScale = scaleLinear()
			.domain([0, log.maxDuration])
			.range([100, 0]);

		const lineGenerator = line()
			.x(d => xScale(d.requestTime))
			.y(d => yScale(d.requestDuration));

		const requests = stepifyArray(log.requests);

		setData(lineGenerator(requests));
	}, [log]);

	return <div className="backup-graph">
		<svg viewBox={`0 0 ${100 * aspectRatio} 100`}>
			<path d={data}/>
			<g className="x-axis"></g>
			<g className="y-axis"></g>
		</svg>
	</div>;
}

function stepifyArray(input) {
	const output = [];
	for (let i = 0; i < input.length; i++) {
		output[i * 2] = input[i];

		if (input[i + 1])
			output[i * 2 + 1] = {
				requestTime: input[i + 1].requestTime,
				requestDuration: input[i].requestDuration
			};
	}
	return output;
}

function formatSize(value){
	if (!value)
		return 0 + 'b';

	if (value < 1000)
		return value + 'b';

	value = divide(value);

	if (value < 1000)
		return value + 'kb';

	value = divide(value);

	if (value < 1000)
		return value + 'mb';

	value = divide(value);

	if (value < 1000)
		return value + 'gb';

	value = divide(value);

	if (value < 1000)
		return value + 'tb';

	function divide(number)
	{
		number /= 1000;

		return Math.round(number * 10) / 10;
	}
}