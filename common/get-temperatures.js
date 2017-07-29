const log = require("./log");

module.exports = async function(connection, minDateUnixTime, maxDateUnixTime, callback)
{
	const sql = `
		select date, temperature, precision
		from temperatures
		where precision = 0
		and date between $minDate and $maxDate
		limit $limit offset $offset;`;

	const limit = 1000;
	let offset = 0;

	const parameters = {
		$minDate: minDateUnixTime,
		$maxDate: maxDateUnixTime,
		$limit: limit,
		$offset: offset
	};

	let rows = null;
	
	while (rows == null || rows.length != 0)
	{
		parameters.$offset = offset;

		log(`reading temperatures - limit: ${limit}, offset: ${offset}`, "green");
		rows = await connection.all(sql, parameters);

		for (let row of rows)
			await callback(row);

		offset += limit;
	}
};
