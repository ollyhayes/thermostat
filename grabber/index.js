const moment = require('moment');
const CronJob = require('cron').CronJob;
const fetch = require('node-fetch');
const log = require('../common/log');
const {deserialiseTemperatures} = require('../web-interface/public/scripts/temperature-serialiser');

let totalRequestTime = 0;
let numberOfRequests = 0;

function start(db) {
	const job = new CronJob(
		'*/10 * 9-17 * * *',
		() => tick(db, () => job.stop()),
		null,
		true);

	job.start();
	log('starting job', 'green');

	// const stopJob = () => job.stop()
}

// have separate jobs for the other precision levels that run first
// have another job that kicks off the first one at a certain time
// record averages

async function tick(db, stopJob) {
	try {
		const limits = db.getLimits();

		const minDate = limits.maxDate ? limits.maxDate.getTime() : new Date(2020, 3, 19).getTime();
		const maxDate = minDate + 5 * 60 * 1000;

		if (maxDate > new Date()) {
			stopJob();
			log(`stopping job, reached ${printChunk({minDate, maxDate})}`, 'red');
			log(`total time: ${totalRequestTime}, average: ${totalRequestTime / numberOfRequests}, number of requests: ${numberOfRequests}`);
		}

		const url = `http://192.168.0.9:8081/data?minDate=${minDate}&maxDate=${maxDate}&precisionLevel=0`;

		const requestStart = Date.now();
		const response = await fetch(url, {headers: {'Accept': 'application/octet-stream'}});
		const buffer = await response.buffer();

		const requestDuration = Date.now() - requestStart;
		totalRequestTime += requestDuration;
		numberOfRequests++;

		const intArray = new Int32Array(
			buffer.buffer,
			buffer.byteOffset,
			buffer.length / Int32Array.BYTES_PER_ELEMENT);
		
		const data = deserialiseTemperatures(intArray);

		db.insert(data.temperatures, 0);

		log(`logged ${data.temperatures.length} values. ${printChunk({minDate, maxDate})}, ` + 
			`request: ${requestDuration}ms, request-size: ${intArray.byteLength} bytes`, 'green');

		// if total time > 1s stop job

	} catch(error) {
		stopJob();
		log(`Error in tick: ${error}`, 'red');
		throw error;
	}
}

module.exports = {start};

function printChunk({minDate, maxDate}) {
	return `chunk: [${printDate(minDate)}, ${printDate(maxDate)}]`.yellow;
}

function printDate(time) {
	return moment(time).format('HH:mm:ss').magenta;
}