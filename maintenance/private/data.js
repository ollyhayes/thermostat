const fs = require('fs').promises;
const path = require('path');

const configFile = path.join(__dirname, '../../common/config.json');
const thermometersDirectory = '/home/olly/tools/thermometers';
// const thermometersDirectory = '/sys/bus/w1/devices/';

function data() {
	return async function(context)
	{

		try {
			const [actualSerials,config] = await Promise.all([
				fs.readdir(thermometersDirectory),
				// (async () => JSON.parse(await fs.readFile(configFile)))(),
				fs.readFile(configFile, {encoding: 'utf8'}).then(JSON.parse)
			]);

			const configSerials = config.thermometers.map(({serial}) => serial);

			const isConfigUpdated = actualSerials.reduce((isUpdated, actualSerial) => {
				if (!configSerials.includes(actualSerial)) {
					const name = '';
					console.log(`New thermometer detected: ${actualSerial}. Named it: ${name}`);
					config.thermometers.push({
						name,
						serial: actualSerial,
						id: 10,
						disabled: false,
						type: 'thermometer'
					});

					return true;
				}
				return isUpdated;
			}, false);

			if (isConfigUpdated) {
				console.log('Writing config file');
				await fs.writeFile(configFile, JSON.stringify(config, undefined, 4));
			}

			context.body = {
				config
			};

		} catch (error) {
			console.log(`Error: ${error}`);
			context.status = 500;
		}
	};
}

module.exports = {
	data
};
