// move these to common area
const getWindowStartDate = (date, precision) => date - date % precision;
const getWindowEndDate = (date, precision) => date - date % precision + precision - 1;

class SpanToWindow
{
	constructor(precision)
	{
		this.precision = precision;
		this.windowEndDate = null;
		this.currentWindow = [];
	}

	async transform(temperatureSpan, next)
	{
		if (!this.windowEndDate)
			this.windowEndDate = getWindowEndDate(temperatureSpan.startDate, this.precision);
		
		if (temperatureSpan.endDate < this.windowEndDate)
		{
			this.currentWindow.push(temperatureSpan);
		}
		else if (temperatureSpan.endDate == this.windowEndDate)
		{
			this.currentWindow.push(temperatureSpan);
			await next(this.currentWindow);
			this.currentWindow = [];
			this.windowEndDate += this.precision;
		}
		else
		{
			this.currentWindow.push({
				startDate: temperatureSpan.startDate,
				endDate: this.windowEndDate,
				temperature: temperatureSpan.temperature
			});
			await next(this.currentWindow);

			const missedWindowCount = (getWindowEndDate(temperatureSpan.endDate) - this.windowEndDate) / this.precision - 1;
			const windowStartDate = getWindowStartDate(this.windowEndDate);

			// could convert this to run all at the same time
			for (let i = 0; i < missedWindowCount; i++)
			{
				await this.perAveragingWindow({
					startDate: windowStartDate + (i + 1) * this.precision,
					endDate: this.windowEndDate + (i + 1) * this.precision,
					temperature: temperatureSpan.temperature
				});
			}

			this.currentWindow = [];
			this.windowEndDate = getWindowEndDate(temperatureSpan.endDate);

			this.currentWindow.push({
				startDate: getWindowStartDate(temperatureSpan.endDate),
				endDate: temperatureSpan.endDate,
				temperature: temperatureSpan.temperature
			});
		}
	}
}

module.exports = SpanToWindow;
