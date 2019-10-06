import React from 'react';
import {thermometers} from '../../../common/config.json';
import {format} from 'd3-format';

export default function Legend({currentTemperatures}) {
	return <div className='legend'>
		<table>
			<tbody>
				{thermometers
					.filter(thermometer => !thermometer.disabled)
					.map(thermometer => {
						return <tr key={thermometer.id}>
							<td style={{color: thermometer.colour}}>{thermometer.name}</td>
							<td style={{color: thermometer.colour}}>{getTemperature(currentTemperatures, thermometer.id)}</td>
						</tr>;
					}) }
			</tbody>
		</table>
	</div>;
}

const formatTemperature = format('.1f');
function getTemperature(temperatures, id) {
	const thermometer = temperatures && temperatures.find(thermometer => thermometer.thermometerId === id);

	return thermometer
		? `${formatTemperature(thermometer.temperatures[0].temperature)}°C`
		: '?';
}