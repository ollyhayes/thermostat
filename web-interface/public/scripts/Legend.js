import React from 'react';
import {thermometers} from '../../../common/config.json';
import {format} from 'd3-format';

export default function Legend({currentTemperatures}) {
	const data = thermometers
		.filter(thermometer => !thermometer.disabled)
		.map(thermometer => ({
			...thermometer,
			temperature: getTemperature(currentTemperatures, thermometer.id)
		}))
		.sort((l, r) => l.temperature > r.temperature ? -1 : 1);

	return <div className='legend'>
		<table>
			<tbody>
				{data.map(({name, colour, temperature, id}) =>
					<tr key={id}>
						<td style={{color: colour}}>{name}</td>
						<td style={{color: colour}}>{temperature}</td>
					</tr>
				)}
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