const sqlite = require("sqlite");
const fs = require("fs");
const log = require("./log");
const fileName = "./database.db";

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

		const date = Math.round(Date.now() / 1000);

		return this.db.run(
			"insert into temperatures (date, temperature) values ($date, $temperature);",
			{
				$date: date,
				$temperature: temperature
			});
	}

	close()
	{
		return this.db.close();
	}
}

module.exports = Database;
