const fs = require('fs').promises;
const path = require('path');
const logsDirectory = './grabber/logs/';

function backups() {
	return async function(context) {
		try {
			const logFiles = (await fs.readdir(logsDirectory))
				.filter(fileName => /log-.*.json/.exec(fileName));

			const logs = await Promise.all(logFiles.map(file =>
				fs.readFile(path.join(logsDirectory, file), {encoding: 'utf8'}).then(JSON.parse))
			);

			const backups = logs
				.filter(log => log.length > 0)
				.map(log => {
					const requests = log.filter(({requestDuration}) => requestDuration);

					return {
						startTime: log[0].requestTime,
						endTime: log[log.length - 1].requestTime,
						transferred: requests.reduce((total, next) => total + next.requestSize, 0),
						maxDuration: requests.reduce((max, next) => Math.max(max, next.requestDuration), 0),
						requests: requests
							.map(({requestTime, requestDuration, minDate, precisionLevel}) => ({
								dataTime: minDate,
								requestTime,
								requestDuration,
								precisionLevel
							}))
					};
				});

			backups.sort((a, b) => b.startTime - a.startTime);

			context.body = backups;
		} catch (error) {
			console.log(`Error: ${error}`);
			context.status = 500;
		}
	};
}

// function processOldStyleData(logs) {
// 	// return logs;
// 	// Some old log files don't have requestTime and aren't sorted right
// 	logs = logs.map(log =>
// 		sort(log
// 			.filter(request => request.minDate && request.requestDuration)
// 			.map(request => ({
// 				requestTime: request.minDate,
// 				...request
// 			})))
// 	);

// 	function sort(array) {
// 		array.sort((a, b) => a.requestTime - b.requestTime);

// 		return array;
// 	}

// 	return logs;
// }

module.exports = {
	backups
};