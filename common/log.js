const moment = require('moment');
require('colors');

function log(message, colour) {
	const time = moment().format('HH:mm:ss').magenta;
	const colouredMessage = colour
		? message[colour]
		: message;

	console.log(`${time} - ${colouredMessage}`);
}

module.exports = log;