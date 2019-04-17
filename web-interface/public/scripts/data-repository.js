import ajax from "./ajax";

export default async function getTemperature(minDate, maxDate)
{
	const min = minDate.getTime();
	const max = maxDate.getTime();

	const data = await ajax(`/data?minDate=${min}&maxDate=${max}`);
	
	return data.map(dataPoint => ({
		...dataPoint,
		date: new Date(dataPoint.date),
	}));
}
