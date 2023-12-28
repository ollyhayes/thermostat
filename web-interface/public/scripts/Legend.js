import React, {useState, useEffect} from 'react';
import {format} from 'd3-format';
import {saveHiddenThermometers} from './storage';

export default function Legend({thermometers, dataTime, triggerRedraw}) {
	const [currentTime, setCurrentTime] = useState(new Date());
	const isCurrent = currentTime - dataTime < 4000;

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
		}))
		.sort((l, r) => (r.temperature || -99) - (l.temperature || -99));

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
						<td className="numeric" style={{color: isCurrent ? thermometer.colour : 'grey' }}>{formatValue(thermometer)}</td>
					</tr>
				)}
			</tbody>
		</table>
	</div>;
}

const temperatureFormatter = format('.1f');
export function formatValue(thermometer) {
	return thermometer.temperature != null
		? `${temperatureFormatter(thermometer.temperature)}°C`
		: thermometer.state || '?';
}