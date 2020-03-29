import '../less/page.less';
import React from 'react';
import ReactDOM from 'react-dom';
import Thermometers from './Thermometers';

document.addEventListener('DOMContentLoaded', async () => {
	// ReactDOM.render(
	// 	<Thermometers thermometers={config.thermometers}/>,
	// 	document.querySelector('.react-root'));

	setInterval(async () => {
		try {
			const {config} = await (await fetch('/data')).json();
			
			ReactDOM.render(
				<>
					<Thermometers thermometers={config.thermometers}/>
				</>,
				document.querySelector('.react-root'));
		} catch (error) {
			ReactDOM.render(
				<span>Error: {error.toString()}</span>,
				document.querySelector('.react-root'));
		}
	},
	1000);
});