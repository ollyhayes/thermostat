const chunkInfoSize = 4;
const tempSize = 3;

function serialiseTemperatures({temperatures, chunk}) {
	const intArray = new Int32Array((temperatures.length * tempSize + chunkInfoSize));

	if (chunk) {
		intArray[0] = chunk.minDate && (chunk.minDate.getTime() / 1000);
		intArray[1] = chunk.maxDate && (chunk.maxDate.getTime() / 1000);
		intArray[2] = chunk.precisionLevel;
		intArray[3] = chunk.special;
	}

	// console.log(intArray[1]);

	for (let i = 0; i < temperatures.length; i++) {
		const bufferInder = i * tempSize + chunkInfoSize;
		const {id, date, temperature} = temperatures[i];

		intArray[bufferInder] = id;
		intArray[bufferInder + 1] = date.getTime() / 1000;
		intArray[bufferInder + 2] = temperature * 10000;
	}

	return intArray;
}

function deserialiseTemperatures(intArray) {
	const tempReadings = (intArray.length - chunkInfoSize) / tempSize;

	const temperatures = [];
	const chunk = {
		minDate: intArray[0] ? new Date(intArray[0] * 1000) : undefined,
		maxDate: intArray[1] ? new Date(intArray[1] * 1000) : undefined,
		precisionLevel: intArray[2],
		special: intArray[3] === 1
	};

	for (let i = 0; i < tempReadings; i++) {
		const bufferIndex = i * tempSize + chunkInfoSize;
		temperatures[i] = {
			id: intArray[bufferIndex],
			date: new Date(intArray[bufferIndex + 1] * 1000),
			temperature: intArray[bufferIndex + 2] / 10000
		};
	}

	return {
		temperatures,
		chunk
	};
}

module.exports = {
	serialiseTemperatures,
	deserialiseTemperatures
};