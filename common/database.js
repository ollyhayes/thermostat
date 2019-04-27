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

		log('opening database' + (isNewDatabase ? ' (creating new)' : ''));

		if (isNewDatabase)
			this.db.exec(createDatabaseSql);
	}

	insert(temperatures, precisionLevel = 0)
	{
		if (!this.insertCommand)
			this.insertCommand = this.db.prepare(
				`insert into temperatures (date, temperature, precisionLevel, thermometerId)
				values (@date, @temperature, @precisionLevel, @thermometerId);`);

		log('inserting data - ' + temperatures.map(t => t.temperature), 'green');

		const date = toUnix(new Date());

		temperatures.forEach(({temperature, id}) =>
			this.insertCommand.run({
				date,
				temperature: toDbTemp(temperature),
				precisionLevel,
				thermometerId: id
			}));
	}

	read(minDate, maxDate, precisionLevel)
	{
		if (!this.readCommand)
			this.readCommand = this.db.prepare(
				`select date, temperature, thermometerId
				from temperatures
				where date between @minDate and @maxDate and precisionLevel = @precisionLevel
				order by date;`);

		const data = this.readCommand.all({
			minDate: toUnix(minDate),
			maxDate: toUnix(maxDate),
			precisionLevel
		});

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
