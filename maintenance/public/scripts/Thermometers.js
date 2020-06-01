import React from 'react';
import {format} from 'd3-format';

import { useState } from './store';
import Icon from './Icon';
import Panel from './Panel';

export default function Thermometers() {
	const {connectedThermometers: {fetchingData, error}} = useState();

	return <Panel name="Connected Thermometers" className='thermometers'>
		{error
			? <span>{error.toString()}</span>
			: <>
				<div className="icon-wrapper">
					<Icon iconName="sync" spinning={true} paused={!fetchingData}/>
				</div>
				<ThermometersTable/>
			</>}
	</Panel>;
}

function ThermometersTable() {
	const {connectedThermometers: {config}} = useState();
	const thermometers = config && config.thermometers || [];

	return <>
		<table>
			<thead>
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>Serial</th>
					<th className="unimportant">Type</th>
					<th className="unimportant">Disabled</th>
					<th>Temp</th>
				</tr>
			</thead>
			<tbody>
				{thermometers.map(thermometer => 
					<tr key={thermometer.id} style={{color: thermometer.colour}}>
						<td>{thermometer.id}</td>
						<td>{thermometer.name}</td>
						<td>{thermometer.serial}</td>
						<td className="unimportant">{thermometer.type}</td>
						<td className="unimportant">{thermometer.disabled ? 'true' : 'false'}</td>
						<td className="numeric">{`${formatTemperature(thermometer.temperature)}`}</td>
					</tr>
				)}
			</tbody>
		</table>
	</>;
}

const temperatureFormatter = format('.1f');
export function formatTemperature(temperature) {
	return temperature != null
		? `${temperatureFormatter(temperature)}°C`
		: '?';
}