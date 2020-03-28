import '../less/page.less';
import React from 'react';
import ReactDOM from 'react-dom';
import config from '../../../common/config.json';

document.addEventListener('DOMContentLoaded', async () => {
	ReactDOM.render(
		<table>
			<thead>
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>Serial</th>
					<th>Type</th>
					<th>Disabled</th>
				</tr>
			</thead>
			<tbody>
				{config.thermometers.map(thermometer => 
					<tr key={thermometer.id}>
						<td>{thermometer.id}</td>
						<td>{thermometer.name}</td>
						<td>{thermometer.serial}</td>
						<td>{thermometer.type}</td>
						<td>{thermometer.disabled ? 'true' : 'false'}</td>
					</tr>
				)}
			</tbody>
		</table>,
		document.querySelector('.react-root'));
});
