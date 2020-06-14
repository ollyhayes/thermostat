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
		const backups = await (await fetch('http://olly.fr.to:39414/backups')).json();

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