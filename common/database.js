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

		let currentWindow = [];
		let windowEndUnixTime = null;

		const perAveragingWindow = async averagingWindow =>
		{
			const average = averagingWindow.reduce((sum, next) => sum + next.temperature, 0) / averagingWindow.length;

			await connection.run(
				insertSql,
				{
					date: windowEndUnixTime - precision / 2,
					temperature: average,
					precision: precision
				});

			log(`inserted average: ${average} as at ${moment(windowEndUnixTime).format("DD/MM/YYYY HH:mm:ss")}`);
		};
		
		const perRow = async row =>
		{
			log(JSON.stringify(row));

			await new Promise(resolve => setTimeout(resolve, 1000));

			// if (!windowEndUnixTime)
			// 	windowEndUnixTime = perRow.date - (perRow.date % precision) + precision;

			// if (row.date < windowEndUnixTime)
			// 	currentWindow.push(row);
			// else
			// {
			// 	await perAveragingWindow(currentWindow);
			// 	currentWindow = [];
			// 	windowEndUnixTime += precision;
			// }
		};

		await connection.exec("begin immediate");

		await getTemperatures(
			connection,
			toUnix(minDate),
			toUnix(maxDate),
			perRow);

		//await perAveragingWindow(currentWindow);

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
