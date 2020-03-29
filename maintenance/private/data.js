const fs = require('fs').promises;
const path = require('path');

const configFile = path.join(__dirname, '../../common/config.json');
const thermometersDirectory = '/home/olly/tools/thermometers';
// const thermometersDirectory = '/sys/bus/w1/devices/';

function data() {
	return async function(context)
	{

		try {
			const [directoryContents,config] = await Promise.all([
				fs.readdir(thermometersDirectory),
				// (async () => JSON.parse(await fs.readFile(configFile)))(),
				fs.readFile(configFile, {encoding: 'utf8'}).then(JSON.parse)
			]);

			const serialRegex = /^\d\d-[0-9a-f]{12}$/;
			const actualSerials = directoryContents
				.filter(serial => serial.match(serialRegex));

			const configSerials = config.thermometers.map(({serial}) => serial);

			const isConfigUpdated = actualSerials.reduce((isUpdated, actualSerial) => {
				if (!configSerials.includes(actualSerial)) {
					config.thermometers.push(createNewThermometer(actualSerial, config));
					console.log(`New thermometer detected: ${actualSerial}.`);
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

function createNewThermometer(serial, config) {
	const newNameRegex = /^new-thermometer (\d+)$/;

	const latestNewThermometer = config.thermometers
		.map(thermometer => thermometer.name.match(newNameRegex))
		.map(result => result && result[1])
		.filter(newThermometerIndex => newThermometerIndex)
		.reduce((max, next) => Math.max(max, next), -1);
	
	const latestNewId = config.thermometers
		.map(thermometer => thermometer.id)
		.reduce((max, next) => Math.max(max, next), -1);

	return {
		serial,
		id: Math.max(latestNewId + 1, 10),
		name: 'new-thermometer ' + (latestNewThermometer + 1),
		dsabled: false,
		type: 'thermometer',
		colour: 'white'
	};
}

module.exports = {
	data
};
