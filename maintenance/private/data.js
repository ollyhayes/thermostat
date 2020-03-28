const fs = require('fs').promises;
const path = require('path');

function data() {
	return async function(context)
	{
		// const query = context.request.query;

		// const thermometers = await fs.readdir('/sys/bus/w1/devices/', 'utf8');
		const [actualSerials,config] = Promise.all(
			await fs.readdir('/home/olly/tools/thermometers'),
			JSON.parse(await fs.readFile(path.join(__dirname, '../common/config.json', 'utf8')))
		);

		const configSerials = config.thermometers.map(({serial}) => serial);
		// if (!actualSerials.all(thermometer => configSerials.includes(thermometer))) {
		// 	// update config object
		// 	// save it to the config
		// 	// in this GET, return it from the new config
		// }

		actualSerials.forEach(actualSerial => {
			if (!configSerials.includes(actualSerial)) {
				config.thermometer.push({
					name: '',
					serial: actualSerial,
					id: 10,
					disabled: false,
					type: 'thermometer'
				});
			}
		});

		context.body = {
			thermometers: actualSerials
		};
	};
}

module.exports = {
	data
};
