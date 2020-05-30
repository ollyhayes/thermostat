import React from 'react';
import { useState } from './store';

export default function Backups() {
	const {backups} = useState();

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
				{/* {thermometers.map(thermometer => 
					<tr key={thermometer.id} style={{color: thermometer.colour}}>
						<td className="numeric">{thermometer.id}</td>
						<td>{thermometer.name}</td>
						<td>{thermometer.serial}</td>
						<td>{thermometer.type}</td>
						<td>{thermometer.disabled ? 'true' : 'false'}</td>
						<td className="numeric">{`${formatTemperature(thermometer.temperature)}`}</td>
					</tr>
				)} */}
			</tbody>
		</table>
		{/* <table>
			<tbody>
				{data.map(thermometer =>
					<tr key={thermometer.id} onClick={() => {
						const inner = thermometers.find(inner => inner.id === thermometer.id);
						inner.hidden = !inner.hidden;
						forceUpdate();
					}}>
						<td style={{color: thermometer.colour}}>{thermometer.name}</td>
						<td className="numeric" style={{color: isCurrent ? thermometer.colour : 'grey' }}>{formatTemperature(thermometer.temperature)}</td>
					</tr>
				)}
			</tbody>
		</table> */}
	</div>;
}