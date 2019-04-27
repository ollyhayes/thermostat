const log = require('../common/log');
const fs = require('fs');

const regex = /t=(-?\d*)/;

let count = 0;

module.exports = function(serial)
{
	const index = count++;
	log(`getting temperature. index: ${index}`);

	return Promise.resolve(Math.sin((Date.now() / 10000) + serial.charCodeAt(13)) * 5 + 15);

	return new Promise((resolve, reject) =>
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
