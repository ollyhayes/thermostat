const Sqlite = require('better-sqlite3');
const fs = require('fs');
const log = require('./log');

const toUnix = date => Math.round(date.getTime() / 1000);
const fromUnix = unix => new Date(unix * 1000);

const toDbTemp = temperature => Math.round((temperature - 15) / 0.0625);
const toTemp = dbTemp => dbTemp * 0.0625 + 15;

const createDatabaseSql = `
	create table temperatures (
	date integer not null,
	temperature integer not null,
	precisionLevel integer not null,
	thermometerId integer not null)`;

// create index temp_date on temperatures (date)
// create index temp_precision on temperatures (precisionLevel)
// create index temp on temperatures (precisionLevel, date)

class Database
{
	constructor(filename)
	{
		this.filename = filename || './database.db';
	}

	open()
	{
		const isNewDatabase = !fs.existsSync(this.filename);
		this.db = new Sqlite(this.filename);
		this.db.pragma('journal_mode = WAL');

		log('opening database' + (isNewDatabase ? ' (creating new)' : ''));

		if (isNewDatabase)
			this.db.exec(createDatabaseSql);
	}

	insert(temperatures, precisionLevel = 0)
	{
		if (!this.insertCommand) {
			const singleInsert = this.db.prepare(
				`insert into temperatures (date, temperature, precisionLevel, thermometerId)
				values (@date, @temperature, @precisionLevel, @thermometerId);`);

			this.insertCommand = this.db.transaction((temperatures, date, precisionLevel) =>
				temperatures.forEach(({temperature, id}) =>
					singleInsert.run({
						date: toUnix(date),
						temperature: toDbTemp(temperature),
						precisionLevel,
						thermometerId: id
					})));
		}

		const date = new Date();

		this.insertCommand(temperatures, date, precisionLevel);

		const duration = Date.now() - date.getTime();

		log(`logging temp - ${temperatures.map(t => t.temperature)} in ${duration}ms`, 'green');
	}

	read(minDate, maxDate, precisionLevel)
	{
		if (!this.readCommand)
			this.readCommand = this.db.prepare(
				`select date, temperature, thermometerId
				from temperatures
				where date between @minDate and @maxDate and precisionLevel = @precisionLevel
				order by date;`);

		const time = Date.now();

		const data = this.readCommand.all({
			minDate: toUnix(minDate),
			maxDate: toUnix(maxDate),
			precisionLevel
		});

		log(`reading temp - ${data.length} values in ${Date.now() - time}ms`, 'cyan');

		return data.map(dataPoint => ({
			date: fromUnix(dataPoint.date),
			temperature: toTemp(dataPoint.temperature),
			id: dataPoint.thermometerId
		}));
	}

	getLimits() {
		if (!this.limitCommand)
			this.limitCommand = this.db.prepare('select min(date) as minDate, max(date) as maxDate from temperatures;');

		const {minDate, maxDate} = this.limitCommand.get();

		return {
			minDate: fromUnix(minDate),
			maxDate: fromUnix(maxDate)
		};
	}

	close()
	{
		log('closing database');
		return this.db.close();
	}
}

module.exports = Database;
