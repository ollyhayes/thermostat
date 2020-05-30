import React, { useEffect, useState as useStateReact } from 'react';
import { useState } from './store';
import {timeFormat} from 'd3-time-format';
import { line } from 'd3-shape';
import { scaleTime } from 'd3';
import moment from 'moment';
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
						<th>Start</th>
						<th>Duration</th>
						<th>Transferred</th>
						<th>Graph</th>
					</tr>
				</thead>
				<tbody>
					{backups.map((log, index) =>
						<tr key={index}>
							<td>{formatTime(log.startTime)}</td>
							<td className="numeric">{moment.duration(moment(log.startTime).diff(log.endTime)).humanize()}</td>
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

function formatSize(value){
	if (!value)
		return 0 + " B";

	if (value < 1000)
		return value + " B";

	value = divide(value);

	if (value < 1000)
		return value + " KB";

	value = divide(value);

	if (value < 1000)
		return value + " MB";

	value = divide(value);

	if (value < 1000)
		return value + " GB";

	value = divide(value);

	if (value < 1000)
		return value + " TB";

	function divide(number)
	{
		number /= 1000;

		return Math.round(number * 10) / 10;
	}
};