export function getZoomExtent(scale, currentMin, currentMax, absoluteMin, absoluteMax) {
	const minZoom = scale(new Date(10000)) - scale(new Date(0));
	const currentZoom = scale(currentMax) - scale(currentMin);
	const maxZoom = scale(absoluteMax) - scale(absoluteMin);
	
	return [[currentZoom / maxZoom], [currentZoom / minZoom]];
}