const moment = require("moment");
const colors = require("colors");

module.exports = function(message)
{
	const time = moment().format("HH:mm:ss").magenta;
	console.log(`${time} - ${message}`);
}
