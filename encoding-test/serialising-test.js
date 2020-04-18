const data = require('./data.json');

data.forEach(temperature => temperature.date = new Date(temperature.date));

function jsonTest() {
	console.log('');
	console.log('json test:');
	console.log(`data has: ${data.length} values`);

	const date = Date.now();

	const serialised = JSON.stringify(data);

	const newDate = Date.now();

	const deserialised = JSON.parse(serialised);

	console.log(`serialising took:   ${newDate - date}ms, length: ${serialised.length}`);
	console.log(`desirialising took: ${Date.now() - newDate}ms, length: ${deserialised.length}`);
}

// {"temperature":12.375,"id":1,"date":"2020-04-18T08:36:41.127Z"},

function binaryTest() {
	console.log('');
	console.log('binary test:');
	console.log(`data has: ${data.length} values`);

	const date = Date.now();

	const serialised = serialise(data, {
		minDate: new Date(2001, 1, 1),
		maxDate: new Date(2020, 12, 1),
		precisionLevel: 2
	});

	const newDate = Date.now();

	const {temperatures, chunkInfo} = deserialise(serialised);

	console.log(`serialising took:   ${newDate - date}ms, length: ${serialised.byteLength}`);
	console.log(`desirialising took: ${Date.now() - newDate}ms, length: ${temperatures.length}`);
}

function serialise(temperatures, chunkInfo) {
	const chunkInfoSize = 3;
	const tempSize = 3;

	const intArray = new Int32Array((temperatures.length * tempSize + chunkInfoSize));

	if (chunkInfo) {
		intArray[0] = chunkInfo.minDate.getTime() / 1000;
		intArray[1] = chunkInfo.maxDate.getTime() / 1000;
		intArray[2] = chunkInfo.precisionLevel;
	}

	for (let i = 0; i < temperatures.length; i++) {
		const bufferInder = i * tempSize + chunkInfoSize;
		const {id, date, temperature} = temperatures[i];

		intArray[bufferInder] = id;
		intArray[bufferInder + 1] = date.getTime() / 1000;
		intArray[bufferInder + 2] = temperature * 10000;
	}

	return intArray;
}

function deserialise(arrayBuffer) {
	const chunkInfoSize = 3;
	const tempSize = 3;
	const tempReadings = (arrayBuffer.length - chunkInfoSize) / tempSize;

	const temperatures = [];
	const chunkInfo = {
		minDate: new Date(arrayBuffer[0] * 1000),
		maxDate: new Date(arrayBuffer[1] * 1000),
		precisionLevel: arrayBuffer[2]
	};

	for (let i = 0; i < tempReadings; i++) {
		const bufferIndex = i * tempSize + chunkInfoSize;
		temperatures[i] = {
			id: arrayBuffer[bufferIndex],
			date: new Date(arrayBuffer[bufferIndex + 1] * 1000),
			temperature: arrayBuffer[bufferIndex + 2] / 10000
		};
	}

	return {
		temperatures,
		chunkInfo
	};
}

jsonTest();
binaryTest();
jsonTest();
binaryTest();