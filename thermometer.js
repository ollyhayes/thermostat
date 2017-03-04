const Rx = require("rxjs");
const log = require("./log");
let i = 0;

module.exports = function()
{
	return new Promise(resolve =>
	{
		const temp = Math.floor(i++ / 2);
		log(`getting temperature: ${temp}`);
		setTimeout(() =>
		{
			log(`got temperature: ${temp}`);
			resolve(temp);
		},
		Math.random() * 1000 + 250);
	});
};
