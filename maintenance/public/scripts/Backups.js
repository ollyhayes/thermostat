import React from 'react';
import { useState } from './store';
import {timeFormat} from 'd3-time-format';

const specifier = '%Y-%m-%d %H-%M-%S';
const formatTime = timeFormat(specifier);

export default function Backups() {
	const {backups: {backups, error}} = useState();

	if (!backups) {
		return <div>
			{error
				? <span>Error loading data: {error}</span>
				: <span>Loading</span>}
		</div>
	}

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
				{backups.map(log => 
					<tr key={log.startTime}>
						<td>{formatTime(log.startTime)}</td>
						<td className="numeric">{log.numberOfRequests}</td>
						<td></td>
						<td className="numeric">{log.maxRequestTime}ms</td>
						<td className="numeric">{log.requestsOverX}</td>
						<td></td>
					</tr>
				)}
			</tbody>
		</table>
	</div>;
}