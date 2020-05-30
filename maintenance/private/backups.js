const fs = require('fs').promises;
const path = require('path');
const logsDirectory = '../grabber/logs/'

function backups() {
	return async function(context) {
		try {
			const logFiles = await fs.readdir(logsDirectory);

			const logs = await Promise.all(logFiles.map(file =>
				fs.readFile(path.join(logsDirectory, file), {encoding: 'utf8'}).then(JSON.parse))
			);

			context.body = logs
				.filter(log => log.length > 0)
				.map(log => ({
					startTime: log[0].minDate,
					numberOfRequests: log.length,
					maxRequestTime: log.reduce((max, next) => Math.max(max, next.requestDuration || 0), 0),
					requestsOverX: log.filter(request => request.requestDuration > 4000).length
				}));


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