// Backup logs live on the backup machine (where the grabber runs), not the Pi.
// Placeholder - point this at your backup machine's maintenance server.
const BACKUPS_URL = 'http://backup-host.example:8081/backups';

export async function fetchData(store) {
	if (store.getValue().selectedPanel !== 'thermometers' || document.hidden)
		return;

	store.updateValue(state => ({
		...state,
		connectedThermometers: {
			...state.connectedThermometers,
			fetchingData: true
		}
	}));

	try {
		const {config} = await (await fetch('/data')).json();

		store.updateValue(state => ({
			...state,
			connectedThermometers: {
				config: config,
				fetchingData: false,
				error: false
			}
		}));
	} catch (error) {
		store.updateValue(state => ({
			...state,
			connectedThermometers: {
				config: undefined,
				fetchingData: false,
				error
			}
		}));
	}
}

export async function fetchBackups(store) {
	try {
		const backups = await (await fetch(BACKUPS_URL)).json();

		store.updateValue(state => ({
			...state,
			backups: {
				backups: backups,
				error: false
			}
		}));
	} catch (error) {
		store.updateValue(state => ({
			...state,
			backups: {
				...state.backups,
				data: undefined,
				error,
			}
		}));
	}
}

export async function selectPanel(store, selectedPanel) {
	store.updateValue(state => ({
		...state,
		selectedPanel
	}));
}