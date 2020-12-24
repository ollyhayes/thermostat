const Sqlite = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
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
	thermometerId integer not null);
	create index date on temperatures (date);
	create index temp on temperatures (precisionLevel, date);`;

class Database
{
	constructor(filename)
	{
		console.log('opening: ', filename)
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

			this.insertCommand = this.db.transaction((temperatures, unixDate, precisionLevel) =>
				temperatures
					.filter(({id}) => id) // temp hack to take account of preform averaging being broken
					.forEach(({temperature, id, date: individualDate}) =>
						singleInsert.run({
							date: individualDate !== undefined
								? toUnix(individualDate)
								: unixDate,
							temperature: toDbTemp(temperature),
							precisionLevel,
							thermometerId: id
						})));
		}

		const date = new Date();

		this.insertCommand(temperatures, toUnix(date), precisionLevel);

		const duration = Date.now() - date.getTime();

		log(`logging temp - ${temperatures.length > 10 ? 'many' : temperatures.map(t => t.temperature)} in ${duration}ms`, 'green');
	}

	readLimit(minDate, limit, precisionLevel) {
		if (!this.readLimitCommand)
			this.readLimitCommand = this.db.prepare(
				`select date, temperature, thermometerId
				from temperatures
				where date >= @minDate and precisionLevel = @precisionLevel
				order by date
				limit @limit;`);

		return this._read(this.readLimitCommand, {
			minDate: toUnix(minDate),
			limit,
			precisionLevel
		});
	}

	read(minDate, maxDate, precisionLevel) {
		if (!this.readCommand)
			this.readCommand = this.db.prepare(
				`select date, temperature, thermometerId
				from temperatures
				where date between @minDate and @maxDate and precisionLevel = @precisionLevel
				order by date;`);

		return this._read(this.readCommand, {
			minDate: toUnix(minDate),
			maxDate: toUnix(maxDate),
			precisionLevel
		});
	}

	_read(command, parameters) {
		const time = Date.now();

		const data = command.all(parameters);

		log(`reading temp - ${data.length} values in ${Date.now() - time}ms`, 'cyan');

		return data.map(dataPoint => ({
			date: fromUnix(dataPoint.date),
			temperature: toTemp(dataPoint.temperature),
			id: dataPoint.thermometerId
		}));
	}

	getLimits(precisionLevel) {
		if (!this.limitCommand) {
			this.limitCommand = {
				unconstrained: this.db.prepare(
					`select min(date) as date from temperatures
					union select max(date) as date from temperatures
					order by date`),
				constrained: this.db.prepare(
					`select min(date) as date from temperatures where precisionLevel = @precisionLevel
					union select max(date) as date from temperatures where precisionLevel = @precisionLevel
					order by date`),
			};
		}

		const limitCommand = this.limitCommand[precisionLevel === undefined ? 'unconstrained' : 'constrained'] 
		const results = limitCommand.all({precisionLevel});

		if (results.length !== 2)
			return {minDate: undefined, maxDate: undefined};

		const [{date: minDate}, {date: maxDate}] = results;

		return {
			minDate: fromUnix(minDate),
			maxDate: fromUnix(maxDate)
		};
	}

	async backup() {
		const backupFile = path.join(path.dirname(this.filename), 'backup.db')

		if (fs.existsSync(backupFile)) {
			log(`Cannot backup database - file already present: ${backupFile}`, 'red');
			return;
		}

		const startTime = Date.now();
		await this.db.backup(
			backupFile,
			{
				progress({totalPages, remainingPages}) {
					log(`Backup progress: ${((totalPages - remainingPages) / totalPages * 100).toFixed(1)}%`, 'yellow')
				}
			});

		log(`Backup successful in ${(Date.now() - startTime) / 1000} seconds`, 'green');
	}

	close()
	{
		log('closing database');
		return this.db.close();
	}
}

module.exports = Database;
