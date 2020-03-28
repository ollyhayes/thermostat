import '../less/page.less';
import React from 'react';
import ReactDOM from 'react-dom';
import config from '../../../common/config.json';
import Thermometers from './Thermometers';

document.addEventListener('DOMContentLoaded', async () => {
	// ReactDOM.render(
	// 	<Thermometers thermometers={config.thermometers}/>,
	// 	document.querySelector('.react-root'));

	setInterval(async () => {
		const {data: {thermometers}, error} = await getData();

		const actualThermometers = !error && thermometers.map(serial => ({
			serial,
			name: '?',
			id: serial,
			type: 'thermometer',
			disabled: '?'
		}));
		const configThermometers = config.thermometers;
		
		ReactDOM.render(
			<>
				<Thermometers thermometers={configThermometers}/>
				{actualThermometers
					? <Thermometers thermometers={actualThermometers}/>
					: <span>{error.message}</span>}
			</>,
			document.querySelector('.react-root'));

	},
	1000);
});

async function getData() {
	try {
		const response = await fetch('/data', {
		});

		const data = await response.json();

		return {data};
	} catch (error) {
		return {error};
	}
}
