const log = require("../common/log");
const fs = require("fs");

const thermometers = {
	chip1: "28-0000092348ee",
	chip2: "28-000007a0024d",
	yellow: "28-030897799788",
	red: "28-030897791ed8",
	yellowRed: "28-03079779a1b8"
};

const getFile = thermometerName => `/sys/bus/w1/devices/${thermometers[thermometerName]}/w1_slave`;
const regex = /t=(-?\d*)/;

let count = 0;

module.exports = function(thermometerName = "yellow")
{
	const index = count++;
	log(`getting temperature. index: ${index}`);

	// return Promise.resolve(Math.sin(Date.now() / 10000) * 5 + 15);

	return new Promise((resolve, reject) =>
	{
		fs.readFile(getFile(thermometerName), "utf8", (error, data) =>
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
