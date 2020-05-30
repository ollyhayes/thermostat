const fs = require('fs').promises;
const path = require('path');

function backups() {
	return async function(context) {
		try {
			const logFiles = await fs.readdir('../grabber/logs/');

			context.body = logFiles;

		} catch (error) {
			console.log(`Error: ${error}`);
			context.status = 500;
		}
	};
}


function createNewThermometer(serial, config) {
	const newNameRegex = /^new-thermometer (\d+)$/;

	const latestNewThermometer = config.thermometers
		.map(thermometer => thermometer.name.match(newNameRegex))
		.map(result => result && result[1])
		.filter(newThermometerIndex => newThermometerIndex)
		.reduce((max, next) => Math.max(max, next), -1);
	
	const latestNewId = config.thermometers
		.map(thermometer => thermometer.id)
		.reduce((max, next) => Math.max(max, next), -1);

	return {
		serial,
		id: Math.max(latestNewId + 1, 10),
		name: 'new-thermometer ' + (latestNewThermometer + 1),
		dsabled: false,
		type: 'thermometer',
		colour: 'white'
	};
}

module.exports = {
	backups
};