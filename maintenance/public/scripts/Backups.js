import React, { useEffect, useState as useStateReact } from 'react';
import { useState } from './store';
import {timeFormat} from 'd3-time-format';
import { line } from 'd3-shape';
import { scaleTime, scaleLinear } from 'd3';
import moment from 'moment';
import Panel from './Panel';

const specifier = '%Y-%m-%d %H:%M:%S';
const formatTime = timeFormat(specifier);

export default function Backups() {
	const {backups: {backups, error}} = useState();

	function renderError() {
		return <div>
			{error
				? <span>Error loading data: {error}</span>
				: <span>Loading</span>}
		</div>;
	}

	function renderBackups() {
		return <div className='backups'>
			<table>
				<thead>
					<tr>
						<th>Start</th>
						<th>Duration</th>
						<th>Requests</th>
						<th>Max duration</th>
						<th>Transferred</th>
						<th>Graph</th>
					</tr>
				</thead>
				<tbody>
					{backups.map((log, index) =>
						<tr key={index}>
							<td>{formatTime(log.startTime)}</td>
							<td className="numeric">{moment.duration(moment(log.startTime).diff(log.endTime)).humanize()}</td>
							<td className="numeric">{log.requests.length}</td>
							<td className="numeric">{log.maxDuration / 1000 + 's'}</td>
							<td className="numeric">{formatSize(log.transferred)}</td>
							<td><Chart log={log}/></td>
						</tr>
					)}
				</tbody>
			</table>
		</div>;
	}

	return <Panel name="Backups">
		{backups
			? renderBackups()
			: renderError()}
	</Panel>;
}

function Chart({log}) {
	const [data, setData] = useStateReact();
	useEffect(() => {
		const xScale = scaleTime()
			.domain([log.startTime, log.endTime])
			.range([0, 1000]);
		const yScale = scaleLinear()
			.domain([0, log.requests.reduce((max, next) => Math.max(max, next.requestDuration), 0)])
			.range([100, 0]);

		const lineGenerator = line()
			.x(d => xScale(d.requestTime))
			.y(d => yScale(d.requestDuration));

		setData(lineGenerator(log.requests));
	});

	return <div className="backup-graph">
		<svg viewBox="0 0 1000 100" width="500">
			<path d={data}/>
		</svg>
	</div>;
}

function formatSize(value){
	if (!value)
		return 0 + 'B';

	if (value < 1000)
		return value + 'B';

	value = divide(value);

	if (value < 1000)
		return value + 'KB';

	value = divide(value);

	if (value < 1000)
		return value + 'MB';

	value = divide(value);

	if (value < 1000)
		return value + 'GB';

	value = divide(value);

	if (value < 1000)
		return value + 'TB';

	function divide(number)
	{
		number /= 1000;

		return Math.round(number * 10) / 10;
	}
}