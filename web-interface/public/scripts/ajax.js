export default function ajax(url, method, json, dataType)
{
	const isBinary = dataType === 'binary';

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
						? request.response
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
