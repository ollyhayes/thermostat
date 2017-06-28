const log = require("../common/log");
const fs = require("fs");

const temp = "/sys/bus/w1/devices/28-0000092348ee/w1_slave";
//const temp = "/sys/bus/w1/devices/28-000007a0024d/w1_slave";
const regex = /t=(\d*)/;

let count = 0;

module.exports = function()
{
	const index = count++;
	log(`getting temperature. index: ${index}`);

	return new Promise((resolve, reject) =>
	{
		fs.readFile(temp, "utf8", (error, data) =>
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
