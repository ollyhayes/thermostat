const {serialiseTemperatures} = require('../public/scripts/temperature-serialiser');

function data(db) {
	return async function(context)
	{
		const query = context.request.query;

		const minDate = new Date(Number(query.minDate));
		const maxDate = query.maxDate && new Date(Number(query.maxDate));
		const limit = query.limit && Number(query.limit);

		const data = maxDate
			? db.read(minDate, maxDate, query.precisionLevel)
			: db.readLimit(minDate, limit, query.precisionLevel);

		if (context.request.headers.accept === 'application/octet-stream'
			|| query.binary) {
			const arrayBuffer = serialiseTemperatures({temperatures: data});

			context.body = Buffer.from(arrayBuffer.buffer);
		} else {
			context.body = data;
		}
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
