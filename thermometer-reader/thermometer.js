const log = require('../common/log');
const fs = require('fs');
const {thermometers, mockThermometers} = require('../common/config.json');

const regex = /t=(-?\d*)/;

let count = 0;

module.exports = function(serial)
{
	const index = count++;
	log(`getting temperature. index: ${index}`);

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
				
				log(`got temperature: ${temperature} degrees. index: ${index}`);

				resolve(temperature);
			});
		});
};

async function getFakeTemperature(serial) {
	const thermometerIndex = thermometers
		.findIndex(thermometer => thermometer.serial === serial);

	return Math.sin((Date.now() / 10000) + thermometerIndex) * 5 + 15;
}