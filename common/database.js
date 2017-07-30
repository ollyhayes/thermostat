const sqlite = require("sqlite");
const fs = require("fs");
const moment = require("moment");
const log = require("./log");
const getTemperatures = require("./get-temperatures");

const toUnix = date => Math.round(date.getTime() / 1000);
const fromUnix = unix => new Date(unix * 1000);

const createDatabaseSql = `
	create table temperatures (
	date integer not null,
	temperature real not null,
	precision integer not null)`;

class Database
{
	constructor(filename)
	{
		this.filename = filename || "./database.db";
	}

	async open()
	{
		const newDatabase = !fs.existsSync(this.filename);
		this.db = await sqlite.open(this.filename);

		log("opening database. is new: " + newDatabase);

		return newDatabase
			? this.db.run(createDatabaseSql)
			: Promise.resolve();
	}

	insert(temperature)
	{
		log("inserting data - " + temperature, "green");

		const date = toUnix(new Date());

		return this.db.run(
			"insert into temperatures (date, temperature) values ($date, $temperature);",
			{
				$date: date,
				$temperature: temperature
			});
	}

	async read(minDate, maxDate)
	{
		const data = await this.db.all(
			"select date, temperature from temperatures where date between $minDate and $maxDate",
			{
				$minDate: toUnix(minDate),
				$maxDate: toUnix(maxDate)
			});

		return data
			.map(dataPoint => ({
				date: fromUnix(dataPoint.date),
				temperature: dataPoint.temperature
			}));
	}

	async calculatePrecisions(minDate, maxDate, precision)
	{
		// start a new connection so the transaction is isolated: https://github.com/mapbox/node-sqlite3/issues/304
		const connection = await sqlite.open(this.filename);

		const insertSql = `
			insert into temperatures (date, temperature, precision)
			values ($date, $temperature, $precision);`;

		const getWindowStartDate = date => date - date % precision;
		const getWindowEndDate = date => date - date % precision + precision - 1;

		const perAveragingWindow = async averagingWindow =>
		{
			const average = averagingWindow.reduce((sum, next) => sum + next.temperature, 0) / averagingWindow.length;

			await connection.run(
				insertSql,
				{
					$date: windowEndDate - precision / 2,
					$temperature: average,
					$precision: precision
				});

			const windowEndDate = getWindowEndDate(averagingWindow[0].startDate);
			log(`inserted average: ${average} as at ${moment(fromUnix(windowEndDate)).format("DD/MM/YYYY HH:mm:ss")}`);
		};

		let windowEndDate = null;
		let currentWindow = [];
		const perTemperatureSpan = async temperatureSpan =>
		{
			if (!windowEndDate)
				windowEndDate = getWindowEndDate(temperatureSpan.startDate);
			
			if (temperatureSpan.endDate < windowEndDate)
			{
				currentWindow.push(temperatureSpan);
			}
			else if (temperatureSpan.endDate == windowEndDate)
			{
				currentWindow.push(temperatureSpan);
				await perAveragingWindow(currentWindow);
				currentWindow = [];
				windowEndDate += precision;
			}
			else
			{
				currentWindow.push({
					startDate: temperatureSpan.startDate,
					endDate: windowEndDate,
					temperature: temperatureSpan.temperature
				});
				await perAveragingWindow(currentWindow);

				const missedWindowCount = (getWindowEndDate(temperatureSpan.endDate) - windowEndDate) / precision - 1;
				const windowStartDate = getWindowStartDate(windowEndDate);

				// could convert this to run all at the same time
				for (let i = 0; i < missedWindowCount; i++)
				{
					await perAveragingWindow({
						startDate: windowStartDate + (i + 1) * precision,
						endDate: windowEndDate + (i + 1) * precision,
						temperature: temperatureSpan.temperature
					});
				}

				currentWindow = [];
				windowEndDate = getWindowEndDate(temperatureSpan.endDate);

				currentWindow.push({
					startDate: getWindowStartDate(temperatureSpan.endDate),
					endDate: temperatureSpan.endDate,
					temperature: temperatureSpan.temperature
				});
			}
		};
		
		let previousRow = null;
		const perRow = async row =>
		{
			if (previousRow)
				perTemperatureSpan({
					startDate: previousRow.date,
					endDate: row.date - 1,
					temperature: previousRow.temperature
				});
				
			previousRow = row;
		};

		await connection.exec("begin immediate");

		await getTemperatures(
			connection,
			toUnix(minDate),
			toUnix(maxDate),
			perRow);

		await perAveragingWindow(currentWindow);

		await connection.exec("commit");
		await connection.close;
	}

	close()
	{
		log("closing database");
		return this.db.close();
	}
}

module.exports = Database;
