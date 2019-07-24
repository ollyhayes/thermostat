
import getTemperature, { getTemperatureExtent } from './data-repository';

self.addEventListener('message', async ({data: [startDate, endDate]}) => {
	const data = await getTemperature(startDate, endDate);

	const extent = getTemperatureExtent(data);

	postMessage({data, extent, startDate, endDate});
});