const Database = require("../../common/database.js");

async function getData(context)
{
	const query = context.request.query;

	const minDate = new Date(Number(query.minDate));
	const maxDate = new Date(Number(query.maxDate));

	const db = new Database("../database.db");
	db.open();

	const data = db.read(minDate, maxDate);

	db.close();
	context.body = data;
}

module.exports = getData;
