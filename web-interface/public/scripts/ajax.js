import {dataType} from '../../../common/config.json';
import {deserialiseTemperatures} from './temperature-serialiser';

export default function ajax(url, method, json)
{
	const isBinary = /^\/data/.exec(url) && dataType === 'binary';

	return new Promise((resolve, reject) =>
	{
		const request = new XMLHttpRequest();
		if (isBinary)
			request.responseType = 'arraybuffer';

		request.onreadystatechange = () =>
		{
			if (request.readyState == XMLHttpRequest.DONE)
			{
				if (request.status == 200)
				{
					const response = isBinary
						? deserialiseTemperatures(request.response).temperatures
						: request.responseText !== ''
							? JSON.parse(request.responseText)
							: undefined;

					resolve(response);
				}
				else
					reject(request.status);
			}
		};

		method = method || 'GET';
		request.open(method, url, true);

		if (json)
		{
			json = JSON.stringify(json);
			request.setRequestHeader('Content-type', 'application/json');
		}

		request.send(json);
	});
}
