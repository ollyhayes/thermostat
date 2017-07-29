module.exports = async function(connection, sql, parameters, callback, batchSize = 1000)
{
	sql += " LIMIT $limit OFFSET $offset";

	let rows = null;
	let offset = 0;

	parameters.$limit = batchSize;
	
	while (rows == null || rows.length != 0)
	{
		parameters.$offset = offset;
		console.log(parameters);
		console.log(`making request - limit: ${batchSize}, offset: ${offset}`);
		rows = await connection.all(sql, parameters);

		for (let row of rows)
			await callback(row);

		offset += batchSize;
	}
};
