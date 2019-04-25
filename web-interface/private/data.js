function createDataRouter(db) {
	return async function(context)
	{
		const query = context.request.query;

		const minDate = new Date(Number(query.minDate));
		const maxDate = new Date(Number(query.maxDate));

		const data = db.read(minDate, maxDate, query.precisionLevel);
		context.body = data;
	};
}

module.exports = createDataRouter;
