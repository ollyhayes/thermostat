import React, {useState, useEffect} from 'react';
import {thermometers} from '../../../common/config.json';
import {format} from 'd3-format';

export default function Legend({currentTemperatures, dataTime}) {
	const [currentTime, setCurrentTime] = useState(new Date());
	const isCurrent = currentTime - dataTime < 2000;

	useEffect(() => {
		if (isCurrent) {
			const timeoutId = setTimeout(() => setCurrentTime(Date.now()), 2500);
			return () => clearTimeout(timeoutId);
		}
	});

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
						<td style={{color: isCurrent ? colour : 'grey' }}>{temperature}</td>
					</tr>
				)}
			</tbody>
		</table>
	</div>;
}

const formatTemperature = format('.1f');
function getTemperature(temperatures, id) {
	const thermometer = temperatures && temperatures.find(thermometer => thermometer.id === id);

	return thermometer
		? `${formatTemperature(thermometer.temperature)}°C`
		: '?';
}