class RowToSpan
{
	constructor()
	{
		this.previousRow = null;
	}

	async transform(row, next)
	{
		if (this.previousRow)
			await next({
				startDate: this.previousRow.date,
				endDate: row.date - 1,
				temperature: this.previousRow.temperature
			});
			
		this.previousRow = row;
	}
}

module.exports = RowToSpan;
