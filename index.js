const sqlite3 = require("sqlite3");
const fs = require("fs");
const getTemperature = require("./thermometer");
const fileName = "./database.db";

class Database
{
	open()
	{
		const newDatabase = fs.existsSync(fileName);
		this.db = new sqlite3.Database(fileName);

		return new Promise((resolve, reject) =>
		{
			if (newDatabase)
				return this._run("create table temperatures (date integer, temperature real)");
			else
				return Promise.resolve();
		});
	}

	run()
	{
		this.timerId = setInterval(() =>
			getTemperature()
				.then(temperature =>
					this._run(
						"insert into temperatures (date, temperature) values ($date, $temperature);"
						{
							date: Date.now(),
							temperature = temperature
						})),
			1000);
	}

	close()
	{
		this.clearInterval(this.timerId);
		this.db.close();
	}

	_run(sql, params)
	{
		return new Promise((resolve, reject) =>
		{
			this.db.run(
				sql,
				params,
				err =>
				{
					if (err)
						reject();
					else
						resolve();
				});
		});
	}
}
