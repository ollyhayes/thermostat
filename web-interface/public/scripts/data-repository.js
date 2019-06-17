import { extent } from 'd3-array';
import ajax from './ajax';

export async function getLimits() {
	const {minDate, maxDate} = await ajax('/limits');

	return {
		minDate: new Date(minDate),
		maxDate: new Date(maxDate)
	};
}

export function getTemperatureExtent(data) {
	const [minTemperature, maxTemperature] = extent(
		data.reduce((flat, next) => [...flat, ...next.values], []),
		d => d.temperature);
	const minWidth = 10;

	if (maxTemperature - minTemperature < minWidth) {
		const midPoint = (maxTemperature + minTemperature) / 2;
		return [midPoint - minWidth / 2, midPoint + minWidth / 2];
	}

	return [minTemperature - 3, maxTemperature + 3];
}