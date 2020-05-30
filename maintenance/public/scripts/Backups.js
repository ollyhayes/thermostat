import React, { useEffect, useState as useStateReact } from 'react';
import { useState } from './store';
import {timeFormat} from 'd3-time-format';
import { line } from 'd3-shape';
import { scaleTime } from 'd3';
import Panel from './Panel';

const specifier = '%Y-%m-%d %H-%M-%S';
const formatTime = timeFormat(specifier);

export default function Backups() {
	const {backups: {backups, error}} = useState();

	function renderError() {
		return <div>
			{error
				? <span>Error loading data: {error}</span>
				: <span>Loading</span>}
		</div>
	}

	function renderBackups() {
		return <div className='backups'>
			<table>
				<thead>
					<tr>
						<th>Date</th>
						<th>Num Requests</th>
						<th>Total Data</th>
						<th>Max request time</th>
						<th>Requests over x</th>
						<th>Graph</th>
					</tr>
				</thead>
				<tbody>
					{backups.map((log, index) =>
						<tr key={index}>
							<td>{formatTime(log.startTime)}</td>
							<td className="numeric">{log.requests.length}</td>
							<td></td>
							<td className="numeric">{log.maxRequestTime}ms</td>
							<td className="numeric">{log.requestsOverX}</td>
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
			.range([0, 500]);
		const yScale = scaleTime()
			.domain([0, log.maxRequestTime])
			.range([0, 200]);

		const lineGenerator = line()
			.x(d => xScale(d.minDate))
			.y(d => yScale(d.requestDuration));

		setData(lineGenerator(log.requests));
	});

	return <svg viewBox="0 0 500 200">
		<path d={data}/>
	</svg>;
}