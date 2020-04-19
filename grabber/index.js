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
	// check db to see what is the latest timestamp we have
	// get the next chunk after that
	// if that chunk holds the current time, then stop the job
	// load that chunk from the pi
	// insert it into the database
	try {

		const limits = db.getLimits();

		const minDate = limits.maxDate.getTime();
		const maxDate = limits.maxDate.getTime() + 5 * 60 * 60;

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

		log(typeof buffer, 'green');



		// if total time > 1s stop job

	} catch(error) {
		stopJob();
		log(`Error in tick: ${error}`, 'red');
	}
}

module.exports = {start};