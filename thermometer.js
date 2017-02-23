const Rx = require("rxjs");
const log = require("./log");

module.exports = function()
{
	return Rx.Observable
		.interval(1000)
		.map(t =>
		{
			const temperature = Math.sin(t - 10) * 10;

			log("seeding - " + temperature);

			return temperature;
		});
};
