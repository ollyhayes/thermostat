const moment = require('moment');
const CronJob = require('cron').CronJob;
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const log = require('../common/log');
const {deserialiseTemperatures} = require('../web-interface/public/scripts/temperature-serialiser');

let jobLog = []; // make this per-job
let precisionLevelsInProgress = [];

function start(db) {
	precisionLevelsInProgress = [0, 1, 2];
	const job = new CronJob(
		'*/10 * * * * *',
		// '*/10 * 7-17 * * *',
		() => tick(db, jobLog, precisionLevelsInProgress, () => {
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

async function tick(db, jobLog, precisionLevelsInProgress, stopJob) {
	try {
		const jobDetails = await getJobDetails(db, jobLog[jobLog.length - 1], precisionLevelsInProgress);

		const {data, responseDetails} = await getData(jobDetails);

		if (!responseDetails.error)
			db.insert(data.temperatures, responseDetails.precisionLevel);

		jobLog.push(responseDetails);
		printDetails(responseDetails);

		// if (requestDuration > 1500) {
		// 	log(`stopping job, single request took over 1500ms: ${requestDuration}ms`, 'red');
		// 	stopJob();
		// }

		if (jobDetails.minDate + 20 * 60 * 10000 > new Date()) {

			log(`reached final chunk for precisionLevel - ${printChunk(jobDetails)}`, 'red');
			precisionLevelsInProgress.splice(precisionLevelsInProgress.indexOf(responseDetails.precisionLevel));
			
			if (precisionLevelsInProgress.length === 0) {
				log(`will stop job, reached final chunk - ${printChunk(jobDetails)}`, 'red');
				stopJob();
				return;
			}
		}

	} catch(error) {
		stopJob();
		log(`Error in tick: ${error}`, 'red');
		throw error;
	}
}

async function getJobDetails(db, previousJob, precisionLevelsInProgress) {
	const wasError = previousJob && previousJob.error;

	const precisionLevel = wasError
		? previousJob.precisionLevel
		: previousJob && (
				precisionLevelsInProgress[
					(precisionLevelsInProgress.indexOf(previousJob.precisionLevel) + 1) % precisionLevelsInProgress.length
				]) || 0;
	const limits = db.getLimits(precisionLevel);

	const minDate = wasError
		? previousJob.minDate + 60 * 1000 // should use different jumps for precisionLevel > 0
		: limits.maxDate
			? limits.maxDate.getTime() + 1000
			: (await getFirstRecordFromTarget(precisionLevel)).getTime() + 1000;

	return {
		minDate,
		limit: 1500,
		precisionLevel,
	};
}

async function getData(jobDetails) {
	const {minDate, limit, precisionLevel} = jobDetails;
	const url = `http://192.168.0.9:8080/data?minDate=${minDate}&limit=${limit}&precisionLevel=${precisionLevel}`;

	const requestStart = Date.now();
	const response = await fetch(url, {headers: {'Accept': 'application/octet-stream'}});

	if (response.status !== 200)
		// throw new Error(await response.text());
		return {
			...jobDetails,
			error: await response.text()
		};

	const buffer = await response.buffer();
	const requestDuration = Date.now() - requestStart;

	const intArray = new Int32Array(
		buffer.buffer,
		buffer.byteOffset,
		buffer.length / Int32Array.BYTES_PER_ELEMENT);

	const data = deserialiseTemperatures(intArray);

	const responseDetails = {
		...jobDetails,
		count: data.temperatures.length,
		requestDuration,
		requestSize: intArray.byteLength
	};
	
	return {
		responseDetails: {
			...jobDetails,
			...responseDetails
		},
		data
	}
}

module.exports = {start};

function printFinalLog(jobLog) {
	const totalTime = jobLog.reduce((totalDuration, {requestDuration}) => totalDuration + requestDuration, 0);

	log(`total time: ${totalTime}, average: ${totalTime / jobLog.length}, number of requests: ${jobLog.length}`, 'green');

	fs.writeFileSync(path.join(__dirname, `log-${printDate()}.json`), JSON.stringify(jobLog));
}

function printDetails(details) {
	const {minDate, limit, precisionLevel, count, requestDuration, requestSize, error} = details;

	if (error) {
		log(`error fetching! ${printChunk(details)} - ${errorDetails.error}`, 'red');
	} else {
		log(`logged ${count} values. ${printChunk(details)}, ` + 
			`request: ${requestDuration}ms, request-size: ${requestSize} bytes`, 'green');
	}
}

function printChunk({minDate, precisionLevel}) {
	return 'chunk'.yellow + `: [${printDate(minDate)}, ${printPrecisionLevel(precisionLevel)}]`.yellow;
}

function printDate(time) {
	return moment(time).format('YY-MM-DD_HH:mm:ss').magenta;
}

function printPrecisionLevel(precisionLevel) {
	const colour = precisionLevel == 0
		? 'green'
		: precisionLevel == 1
			? 'yellow'
			: 'red';

	return ('level: ' + precisionLevel)[colour];
}

async function getFirstRecordFromTarget(precisionLevel) {
	const response = await fetch(`http://192.168.0.9:8080/limits?precisionLevel=${precisionLevel}`);
	const limits = await response.json();

	return new Date(limits.minDate);
}
