const moment = require("moment");

module.exports = function(message)
{
	const time = moment().format("HH:mm:ss");
	console.log(`${time} - ${message}`);
}
