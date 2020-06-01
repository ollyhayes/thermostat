import '../less/page.less';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider, createStore } from './store.js';
import { fetchData, fetchBackups, selectPanel } from './actions';
import moment from 'moment';

moment.locale('gb');

const store = createStore({
	connectedThermometers: {
		config: undefined,
		fetchingData: false,
		error: false
	},
	backups: {
		error: false,
		backups: undefined
	},
	selectedPanel: window.location.hash.substring(1)
});

store.subscribe(state => {
	const newHash = '#' + state.selectedPanel;
	if (newHash !== window.location.hash) {
		window.history.pushState({}, '', newHash);
	}
});

window.addEventListener('popstate', () => {
	selectPanel(store, window.location.hash.substring(1));
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