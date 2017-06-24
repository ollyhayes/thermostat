const sqlite = require("sqlite");
const fs = require("fs");
const log = require("../log");
const fileName = "./database.db";

const toUnix = date => Math.Round(date.getTime() / 1000);

class Database
{
	async open()
	{
		const newDatabase = !fs.existsSync(fileName);
		this.db = await sqlite.open(fileName);

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
			"select date, temperature from temparetures where date between $minDate and $maxDate",
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
