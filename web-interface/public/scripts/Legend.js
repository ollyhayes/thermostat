import * as React from "react";
import {thermometers} from '../../../common/config.json';

export default function Legend(currentTemperatures) {
	return <div className='legend'>
		<table>
			<tbody>
				{thermometers
					.filter(thermometer => !thermometer.disabled)
					.map(thermometer => {
					return <tr>
						<td style={{color: thermometer.colour}}>{thermometer.name}</td>
						<td style={{color: thermometer.colour}}>35°</td>
					</tr>;
				}) }
			</tbody>
		</table>
	</div>;
}