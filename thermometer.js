module.exports.getTemperature = () =>
{
	const time = (Date.now() / (1000 * 60 * 60));

	const pos = (Math.sin(time) + 1) / 2;

	const temperature = pos * 30;

	return temperature - (temperature % 0.5);
};
