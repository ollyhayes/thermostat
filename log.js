const moment = require("moment");
const colors = require("colors");

module.exports = function(message, colour)
{
	const time = moment().format("HH:mm:ss").magenta;
	const colouredMessage = colour
		? message[colour]
		: message;

	console.log(`${time} - ${colouredMessage}`);
}
