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
					startTime: getRequestTime(log[0]),
					endTime: getRequestTime(log[log.length - 1]),
					transferred: log.reduce((total, next) => total + next.requestSize, 0),
					requests: log.map(({minDate, requestDuration}) => ({minDate, requestDuration}))
				}));
		} catch (error) {
			console.log(`Error: ${error}`);
			context.status = 500;
		}
	};
}

function getRequestTime(request) {
	// Some old log files don't have requestTime
	return request.requestTime || request.minDate;
}

module.exports = {
	backups
};