const CronJob = require('cron').CronJob;
const fetch = require('node-fetch');
const log = require('../common/log');
const {deserialiseTemperatures} = require('../web-interface/public/scripts/temperature-serialiser');

function start(db) {
	const job = new CronJob(
		'*/10 * 9-17 * * *',
		() => tick(db, () => job.stop()),
		null,
		true);

	job.start();
	log('starting job')

	// const stopJob = () => job.stop()
}

// have another job that kicks off the first one at a certain time

async function tick(db, stopJob) {
	// getting there, next check the dates and things
	try {

		const limits = db.getLimits();

		const minDate = limits.maxDate
			? limits.maxDate.getTime()
			: new Date(2020, 3, 19).getTime();
		const maxDate = minDate + 5 * 60 * 1000;

		if (maxDate > new Date()) {
			stopJob();
			log('stopping job', 'red');
		}

		const url = `http://192.168.0.9:8081/data?minDate=${minDate}&maxDate=${maxDate}&precisionLevel=0`;

		const response = await fetch(url, {headers: {'Accept': 'application/octet-stream'}});
		const buffer = await response.buffer();

		const intArray = new Int32Array(
			buffer.buffer,
			buffer.byteOffset,
			buffer.length / Int32Array.BYTES_PER_ELEMENT);

		const data = deserialiseTemperatures(intArray);

		db.insert(data.temperatures, 0);




		// if total time > 1s stop job

	} catch(error) {
		stopJob();
		log(`Error in tick: ${error}`, 'red');
		throw error;
	}
}

module.exports = {start};