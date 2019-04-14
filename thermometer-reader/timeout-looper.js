const log = require("../common/log");
const Rx = require("rxjs");

module.exports = function(timeout, action)
{
	async function loop(observer, options)
	{
		while(!options.stopped)
		{
			var time = Date.now();

			var value = await action();
			observer.next(value);

			var timeTillNextTrigger = timeout - (Date.now() - time);

			//console.log("iteration over - time till next: ", timeTillNextTrigger);

			if (timeTillNextTrigger > 0)
				await new Promise(resolve => setTimeout(() => resolve(), timeTillNextTrigger));
		}
	}

	return Rx.Observable.create(observer =>
	{
		var options = {
			stopped: false
		};

		loop(observer, options);

		return () => {options.stopped = true; log("stopped timeout looper!");};
	});
};