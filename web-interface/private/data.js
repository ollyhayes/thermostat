// const Buffer = require('buffer');
const {serialiseTemperatures} = require('../public/scripts/temperature-serialiser');

function data(db) {
	return async function(context)
	{
		const query = context.request.query;

		const minDate = new Date(Number(query.minDate));
		const maxDate = new Date(Number(query.maxDate));

		const data = db.read(minDate, maxDate, query.precisionLevel);
		// context.body = data;

		const arrayBuffer = serialiseTemperatures({temperatures: data});

		console.log(typeof arrayBuffer);

		context.body = Buffer.from(arrayBuffer.buffer);
	};
}

function limits(db) {
	return async function(context)
	{
		const data = db.getLimits();
		context.body = data;
	};
}

module.exports = {
	data,
	limits
};
