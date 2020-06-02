const fs = require('fs').promises;
const path = require('path');

const readThermometer = require('../../thermometer-reader/thermometer');

const configFile = path.join(__dirname, '../../common/config.json');
const thermometersDirectory = '/sys/bus/w1/devices/';

const getConnectedThermometers = (function() {
	const initialConfig = require(configFile);
	const initialConfiguredThermometers = initialConfig.thermometers
		.filter(({type}) => type === 'thermometer')
		.map(({serial}) => serial);

	return initialConfig.thermometerReader.mock
		? initialConfiguredThermometers
		: fs.readdir(thermometersDirectory);
})();

function data() {
	return async function(context) {
		try {
			const [directoryContents, config] = await Promise.all([
				getConnectedThermometers,
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

			await Promise.all(actualSerials.map(serial => 
				readThermometer(serial).then(temperature => 
					config.thermometers
						.find(thermometer => thermometer.serial === serial)
						.temperature = temperature)));

			context.body = {
				config
			};

		} catch (error) {
			console.log(`Thermometers Error: ${error}`);
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
