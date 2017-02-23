const sqlite3 = require("sqlite3");
const fs = require("fs");
const log = require("./log");
const fileName = "./database.db";

class Database
{
	open()
	{
		const newDatabase = !fs.existsSync(fileName);
		this.db = new sqlite3.Database(fileName);

		log("opening database. is new: " + newDatabase);

		return newDatabase
			? this._run("create table temperatures (date integer, temperature real)")
			: Promise.resolve(this);
	}

	insert(temperature)
	{
		log("inserting data - " + temperature);

		return this._run(
			"insert into temperatures (date, temperature) values ($date, $temperature);",
			{
				date: Date.now(),
				temperature: temperature
			});
	}

	close()
	{
		return new Promise((resolve, reject) =>
		{
			this.db.close(error => error
				? reject(error)
				: resolve());
		});
	}

	_run(sql, params)
	{
		return new Promise((resolve, reject) =>
		{
			this.db.run(
				sql,
				params,
				error => error
					? reject(error)
					: resolve()
			);
		});
	}
}

module.exports = Database;
