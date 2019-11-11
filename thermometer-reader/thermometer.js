const fs = require('fs');
const {thermometers, mockThermometers} = require('../common/config.json');

const regex = /t=(-?\d*)/;

module.exports = function(serial)
{
	return mockThermometers
		? getFakeTemperature(serial)
		: new Promise((resolve, reject) =>
		{
			fs.readFile(`/sys/bus/w1/devices/${serial}/w1_slave`, 'utf8', (error, data) =>
			{
				if (error)
					return reject(error);
				
				const result = regex.exec(data);

				if (!result)
					return reject();

				const t = result[1];
				const temperature = t / 1000;

				return resolve(temperature);
			});
		}).catch(error => {
			const thermometer = getThermometer(serial);
			console.log(`Error reading ${thermometer.name} thermometer`);
			return 0;
		});
};

function getThermometer(serial) {
	return thermometers
		.find(thermometer => thermometer.serial === serial);
}

async function getFakeTemperature(serial) {
	const thermometerIndex = thermometers
		.findIndex(thermometer => thermometer.serial === serial);

	const temperature = Math.sin((Date.now() / 10000) + thermometerIndex) * 20 + 5;

	return Math.round(temperature * 100) / 100;
}
