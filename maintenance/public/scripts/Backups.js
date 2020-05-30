import React from 'react';
import { useState } from './store';

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
						<td>{log.startTime}</td>
						<td>{log.numberOfRequests}</td>
						<td></td>
						<td>{log.maxRequestTime}</td>
						<td>{log.requestsOverX}</td>
						<td></td>
					</tr>
				)}
			</tbody>
		</table>
	</div>;
}