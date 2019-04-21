const Sqlite = require("better-sqlite3");
const fs = require("fs");
const log = require("./log");
// const getTemperatures = require("./get-temperatures");

// const RowToSpan = require("./transformers/row-to-span");
// const SpanToWindow = require("./transformers/span-to-window");
// const WindowInserter = require("./transformers/window-inserter");

const toUnix = date => Math.round(date.getTime() / 1000);
const fromUnix = unix => new Date(unix * 1000);

const createDatabaseSql = `
	create table temperatures (
	date integer not null,
	temperature real not null,
	precisionLevel integer not null,
	thermometerId integer not null)`;

class Database
{
	constructor(filename)
	{
		this.filename = filename || "./database.db";
		this.insertCommand = null;
		this.readCommand = null;
	}

	open()
	{
		const isNewDatabase = !fs.existsSync(this.filename);
		this.db = new Sqlite(this.filename);

		log("opening database" + (isNewDatabase ? " (creating new)" : ""));

		if (isNewDatabase)
			this.db.exec(createDatabaseSql);
	}

	insert(temperatures, precisionLevel = 0)
	{
		if (!this.insertCommand)
			this.insertCommand = this.db.prepare(
				`insert into temperatures (date, temperature, precisionLevel, thermometerId)
				values (@date, @temperature, @precisionLevel, @thermometerId);`);

		if (temperatures.length === undefined)
			return console.log(temperatures);
		log("inserting data - " + temperatures.map(t => t.temperature), "green");

		const date = toUnix(new Date());

		temperatures.forEach(({temperature, id}) =>
			this.insertCommand.run({
				date,
				temperature,
				precisionLevel,
				thermometerId: id
			}));
	}

	read(minDate, maxDate)
	{
		if (!this.readCommand)
			this.readCommand = this.db.prepare(
				`select date, temperature, thermometerId
				from temperatures
				where date between @minDate and @maxDate and precisionLevel = 0
				order by date;`);

		const data = this.readCommand.all({
			minDate: toUnix(minDate),
			maxDate: toUnix(maxDate)
		});

		return data.map(dataPoint => ({
			date: fromUnix(dataPoint.date),
			temperature: dataPoint.temperature,
			id: dataPoint.thermometerId
		}));
	}

	// 	async calculatePrecisions(minDate, maxDate, precision)
	// 	{
	// 		// start a new connection so the transaction is isolated: https://github.com/mapbox/node-sqlite3/issues/304
	// 		const connection = await sqlite.open(this.filename);

	// 		const rowToSpan = new RowToSpan();
	// 		const spanToWindow = new SpanToWindow(precision);
	// 		const windowInserter = new WindowInserter(precision);

	// 		await connection.exec("begin immediate");

	// 		await getTemperatures(
	// 			connection,
	// 			toUnix(minDate),
	// 			toUnix(maxDate),
	// 			row => rowToSpan.transform(
	// 				row,
	// 				span => spanToWindow.transform(
	// 					span,
	// 					window => windowInserter.insert(window))));


	// 		// ah, what about this?
	// 		//await perAveragingWindow(currentWindow);

	// 		await connection.exec("commit");
	// 		await connection.close;
	// 	}

	close()
	{
		log("closing database");
		return this.db.close();
	}
}

module.exports = Database;
