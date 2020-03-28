const fs = require('fs').promises;

function data() {
	return async function(context)
	{
		// const query = context.request.query;

		const thermometers = await fs.readdir('/home/olly/tools/thermometers', 'utf8');
		// const thermometers = await fs.readdir('/sys/bus/w1/devices/', 'utf8');


		context.body = {
			thermometers
		};
	};
}

module.exports = {
	data
};
