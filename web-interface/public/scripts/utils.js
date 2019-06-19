import { extent } from 'd3-array';
import ajax from './ajax';

export function getZoomExtent(scale, currentMin, currentMax, absoluteMin, absoluteMax) {
	const minZoom = scale(new Date(10000)) - scale(new Date(0));
	const currentZoom = scale(currentMax) - scale(currentMin);
	const maxZoom = scale(absoluteMax) - scale(absoluteMin);
	
	return [[currentZoom / maxZoom], [currentZoom / minZoom]];
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

export async function getLimits() {
	const {minDate, maxDate} = await ajax('/limits');

	return {
		minDate: new Date(minDate),
		maxDate: new Date(maxDate)
	};
}