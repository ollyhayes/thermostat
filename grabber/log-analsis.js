const logFile = process.argv[2];

const log = require('./' + logFile);
log.forEach(request => request.requestTime = new Date(request.minDate));

console.log(`Total requests: ${log.length}`);

const maxTime = log.reduce((max, next) => Math.max(max, next.requestDuration || 0), 0);
console.log(`Max request time: ${maxTime}ms`);

const durationCutoff = 4000;
const requestsAbove = log.filter(request => request.requestDuration > durationCutoff);

console.log(`Request above ${durationCutoff}ms: ${requestsAbove.length}`);
