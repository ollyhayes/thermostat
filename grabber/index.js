const moment = require('moment');
const CronJob = require('cron').CronJob;
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const log = require('../common/log');
const {deserialiseTemperatures} = require('../web-interface/public/scripts/temperature-serialiser');

let jobLog = []; // make this per-job

function start(db) {
	const job = new CronJob(
		'*/10 * * * * *',
		// '*/10 * 7-17 * * *',
		() => tick(db, jobLog, () => {
			job.stop();
			printFinalLog(jobLog);
		}),
		null,
		true);

	job.start();
	log('starting job', 'green');

	return () => {
		job.stop();
		log('stopping grabber job', 'green');
		printFinalLog(jobLog);
	};
}

// have separate jobs for the other precision levels that run first
// have another job that kicks off the first one at a certain time
// record averages

async function tick(db, jobLog, stopJob) {
	try {
		const limits = db.getLimits();
		const precisionLevel = 0;

		const lastJob = jobLog[jobLog.length - 1];
		const wasError = lastJob && lastJob.error;

		const minDate = wasError
			? lastJob.minDate + 60 * 1000
			: limits.maxDate
				? limits.maxDate.getTime()
				: (await getFirstRecordFromTarget()).getTime();

		const maxDate = undefined;//minDate + 60 * 60 * 1000;
		const limit = 1500;

		const url = `http://192.168.0.9:8080/data?minDate=${minDate}&limit=${limit}&precisionLevel=${precisionLevel}`;

		const requestStart = Date.now();
		const response = await fetch(url, {headers: {'Accept': 'application/octet-stream'}});

		if (response.status !== 200) {
			const logItem = {
				minDate,
				maxDate,
				limit,
				precisionLevel,
				error: true
			};

			jobLog.push(logItem);

			log(`error fetching! ${printChunk(logItem)} - ${await response.text().catch(() => '')}`, 'red');

			return;
		}

		const buffer = await response.buffer();
		const requestDuration = Date.now() - requestStart;

		const intArray = new Int32Array(
			buffer.buffer,
			buffer.byteOffset,
			buffer.length / Int32Array.BYTES_PER_ELEMENT);
		
		const data = deserialiseTemperatures(intArray);

		db.insert(data.temperatures, 0);

		const logItem = {
			minDate,
			maxDate,
			limit,
			precisionLevel,
			count: data.temperatures.length,
			requestDuration,
			requestSize: intArray.byteLength
		};
		jobLog.push(logItem);
		// log(`chunk received: ${logItem}`);
		log(`logged ${logItem.count} values. ${printChunk(logItem)}, ` + 
			`request: ${requestDuration}ms, request-size: ${logItem.requestSize} bytes`, 'green');

		// if (requestDuration > 1500) {
		// 	log(`stopping job, single request took over 1500ms: ${requestDuration}ms`, 'red');
		// 	stopJob();
		// }

		// if (maxDate > new Date()) {
		if (minDate + 20 * 60 * 10000 > new Date()) {
			log(`stopping job, reached final chunk - ${printChunk({minDate, maxDate})}`, 'red');
			stopJob();
		}

	} catch(error) {
		stopJob();
		log(`Error in tick: ${error}`, 'red');
		throw error;
	}
}

module.exports = {start};

function printFinalLog(jobLog) {
	const totalTime = jobLog.reduce((totalDuration, {requestDuration}) => totalDuration + requestDuration, 0);

	log(`total time: ${totalTime}, average: ${totalTime / jobLog.length}, number of requests: ${jobLog.length}`, 'green');

	fs.writeFileSync(path.join(__dirname, 'log.json'), JSON.stringify(jobLog));
}

function printChunk({minDate, precisionLevel}) {
	return `chunk: [${printDate(minDate)}, ${printPrecisionLevel(precisionLevel)}]`.yellow;
}

function printDate(time) {
	return moment(time).format('YY-MM-DD HH:mm:ss').magenta;
}

function printPrecisionLevel(precisionLevel) {
	const colour = precisionLevel == 0
		? 'green'
		: precisionLevel == 1
			? 'yellow'
			: 'red';

	return ('level: ' + precisionLevel)[colour];
}

async function getFirstRecordFromTarget() {
	const response = await fetch('http://192.168.0.9:8080/limits');
	const limits = await response.json();

	return new Date(limits.minDate);
}
