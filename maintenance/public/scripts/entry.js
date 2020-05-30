import '../less/page.less';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider, createStore } from './store.js';
import { fetchData, fetchBackups } from './actions';

const store = createStore({
	connectedThermometers: {
		config: undefined,
		fetchingData: false,
		error: false
	},
	backups: {
		error: false,
		backups: undefined
	}
});

document.addEventListener('DOMContentLoaded', async () => {
	ReactDOM.render(
		<Provider store={store}>
			<App/>
		</Provider>,
		document.querySelector('.react-root'));

	(async function fetchLoop() {
		await fetchData(store);
		setTimeout(fetchLoop, 1000);
	})();

	await fetchBackups(store);
});