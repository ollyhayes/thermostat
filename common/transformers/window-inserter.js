const log = require("../log");
const moment = require("moment");

// move these to common area
const getWindowEndDate = (date, precision) => date - date % precision + precision - 1;
const fromUnix = unix => new Date(unix * 1000);

const insertSql = `
	insert into temperatures (date, temperature, precision)
	values ($date, $temperature, $precision);`;

class WindowInserter
{
	constructor(precision)
	{
		this.precision = precision;
	}

	async insert(averagingWindow, connection)
	{
		const average = averagingWindow.reduce((sum, next) => sum + next.temperature, 0) / averagingWindow.length;

		await connection.run(
			insertSql,
			{
				$date: windowEndDate - this.precision / 2,
				$temperature: average,
				$precision: this.precision
			});

		const windowEndDate = getWindowEndDate(averagingWindow[0].startDate);
		log(`inserted average: ${average} as at ${moment(fromUnix(windowEndDate)).format("DD/MM/YYYY HH:mm:ss")}`);
	}
}

module.exports = WindowInserter;
