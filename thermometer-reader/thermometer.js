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
					reject(error);
				
				const t = regex.exec(data)[1];
				const temperature = t / 1000;

				resolve(temperature);
			});
		});
};

async function getFakeTemperature(serial) {
	const thermometerIndex = thermometers
		.findIndex(thermometer => thermometer.serial === serial);

	const temperature = Math.sin((Date.now() / 10000) + thermometerIndex) * 5 + 15;

	return Math.round(temperature * 100) / 100;
}