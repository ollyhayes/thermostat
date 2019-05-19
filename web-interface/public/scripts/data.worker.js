
import getTemperature, { getLimits, getTemperatureExtent } from './data-repository';

self.addEventListener('message', ({data: [startDate, endDate]}) => {
	console.log('worker triggered', startDate, endDate);

	postMessage({data: ["test"], extent: ["test2"]});
});