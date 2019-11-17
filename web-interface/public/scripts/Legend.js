import React, {useState, useEffect} from 'react';
import {thermometers} from '../../../common/config.json';
import {format} from 'd3-format';
import {saveHiddenThermometers} from './storage';

export default function Legend({currentTemperatures, dataTime, triggerRedraw}) {
	const [currentTime, setCurrentTime] = useState(new Date());
	const isCurrent = currentTime - dataTime < 2000;

	useEffect(() => {
		if (isCurrent) {
			const timeoutId = setTimeout(() => setCurrentTime(Date.now()), 2500);
			return () => clearTimeout(timeoutId);
		}
	});
	const [, updateState] = useState();
	const forceUpdate = () => updateState({});

	const data = thermometers
		.filter(thermometer => !thermometer.disabled)
		.map(thermometer => ({
			...thermometer,
			colour: thermometer.hidden ? 'grey' : thermometer.colour,
			temperature: getTemperature(currentTemperatures, thermometer.id)
		}))
		.sort((l, r) => l.temperature > r.temperature ? -1 : 1);

	return <div className='legend'>
		<table>
			<tbody>
				{data.map(thermometer =>
					<tr key={thermometer.id} onClick={() => {
						const inner = thermometers.find(inner => inner.id === thermometer.id);
						inner.hidden = !inner.hidden;
						triggerRedraw();
						forceUpdate();
						saveHiddenThermometers();
					}}>
						<td style={{color: thermometer.colour}}>{thermometer.name}</td>
						<td className="numeric" style={{color: isCurrent ? thermometer.colour : 'grey' }}>{formatTemperature(thermometer.temperature)}</td>
					</tr>
				)}
			</tbody>
		</table>
	</div>;
}

function getTemperature(temperatures, id) {
	const thermometer = temperatures && temperatures.find(thermometer => thermometer.id === id);

	return thermometer && thermometer.temperature;
}

const temperatureFormatter = format('.1f');
function formatTemperature(temperature) {
	return temperature != null
		? `${temperatureFormatter(temperature)}°C`
		: '?';
}