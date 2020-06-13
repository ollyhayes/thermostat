const moment = require('moment');
const fs = require('fs').promises;
const path = require('path');
const logsDirectory = './logs/';
const updatedLogsDirectory = './logs-updated/';

async function convert() {
	const logFiles = (await fs.readdir(logsDirectory))
		.filter(fileName => /log-.*.json/.exec(fileName));

	const logs = await Promise.all(logFiles.map(file =>
		fs.readFile(path.join(logsDirectory, file), {encoding: 'utf8'}).then(JSON.parse))
	);

	const updatedLogs = logs
		.map(log => ({
			requests: log,
			target: 'dev'
		}));

	for (let log of updatedLogs) {
		const minDate = log.requests[0]
			? log.requests[0].minDate
			: moment();
		await fs.writeFile(
			path.join(updatedLogsDirectory, `log-${printDate(minDate)}.json`),
			JSON.stringify(log)
		);
	}
}

convert();

function printDate(time) {
	return moment(time).format('YYYY-MM-DD_HH:mm:ss');
}