const XMLHttpRequest = window.XMLHttpRequest;

export default function ajax(url, method, json)
{
	return new Promise((resolve, reject) =>
	{
		const request = new XMLHttpRequest();

		request.onreadystatechange = () =>
		{
			if (request.readyState == XMLHttpRequest.DONE)
			{
				if (request.status == 200)
				{
					const response = request.responseText !== ''
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
