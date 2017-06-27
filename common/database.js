const sqlite = require("sqlite");
const fs = require("fs");
const log = require("../log");

const toUnix = date => Math.round(date.getTime() / 1000);

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
			? this.db.run("create table temperatures (date integer, temperature real)")
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

	read(minDate, maxDate)
	{
		return this.db.all(
			"select date, temperature from temperatures where date between $minDate and $maxDate",
			{
				$minDate: toUnix(minDate),
				$maxDate: toUnix(maxDate)
			});
	}

	close()
	{
		return this.db.close();
	}
}

module.exports = Database;
