import {thermometers} from '../../../common/config.json';

export function saveHiddenThermometers() {
	localStorage.setItem(
		'hidden-thermometers',
		JSON.stringify(thermometers
			.filter(inner => inner.hidden)
			.map(thermometer => thermometer.id)));
}

export function loadHiddenThermometers() {
	const hiddenThermometers = localStorage.getItem('hidden-thermometers');

	thermometers.forEach(thermometer =>
		thermometer.hidden = hiddenThermometers.includes(thermometer.id));
}