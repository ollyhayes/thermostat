const db = require("../../common/database.js");

module.export = async function getData(context)
{
	const query = context.request.query;

	const minDate = new Date(query.minDate);
	const maxDate = new Date(query.maxDate);

	const data = await db.read(minDate, maxDate);

	context.body = data;
};
