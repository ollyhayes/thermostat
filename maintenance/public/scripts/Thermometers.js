import React from 'react';
import {format} from 'd3-format';

import { useState } from './store';
import Icon from './Icon';
import Panel from './Panel';

export default function Thermometers() {
	const {connectedThermometers: {fetchingData, error}} = useState();

	return <Panel name="Connected Thermometers">
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

	// const [currentTime, setCurrentTime] = useState(new Date());
	// const isCurrent = currentTime - dataTime < 2000;

	// useEffect(() => {
	// 	if (isCurrent) {
	// 		const timeoutId = setTimeout(() => setCurrentTime(Date.now()), 2500);
	// 		return () => clearTimeout(timeoutId);
	// 	}
	// });
	// const [, updateState] = useState();
	// const forceUpdate = () => updateState({});

	// const data = thermometers
	// 	.filter(thermometer => !thermometer.disabled)
	// 	.map(thermometer => ({
	// 		...thermometer,
	// 		colour: thermometer.hidden ? 'grey' : thermometer.colour,
	// 		temperature: getTemperature(currentTemperatures, thermometer.id)
	// 	}))
	// 	.sort((l, r) => l.temperature > r.temperature ? -1 : 1);

	return <div className='thermometers'>
		<table>
			<thead>
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>Serial</th>
					<th>Type</th>
					<th>Disabled</th>
					<th>Temp</th>
				</tr>
			</thead>
			<tbody>
				{thermometers.map(thermometer => 
					<tr key={thermometer.id} style={{color: thermometer.colour}}>
						<td className="numeric">{thermometer.id}</td>
						<td>{thermometer.name}</td>
						<td>{thermometer.serial}</td>
						<td>{thermometer.type}</td>
						<td>{thermometer.disabled ? 'true' : 'false'}</td>
						<td className="numeric">{`${formatTemperature(thermometer.temperature)}`}</td>
					</tr>
				)}
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

// function getTemperature(temperatures, id) {
// 	const thermometer = temperatures && temperatures.find(thermometer => thermometer.id === id);

// 	return thermometer && thermometer.temperature;
// }

// const temperatureFormatter = format('.1f');
// function formatTemperature(temperature) {
// 	return temperature != null
// 		? `${temperatureFormatter(temperature)}°C`
// 		: '?';
// }
const temperatureFormatter = format('.1f');
export function formatTemperature(temperature) {
	return temperature != null
		? `${temperatureFormatter(temperature)}°C`
		: '?';
}