// import * as repository from './repository';
// import uuid from 'uuid/v1';
// import {reject} from 'ramda';

export async function fetchData(store) {
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

// export async function createNote(store, newNote) {
// 	newNote = {
// 		...newNote,
// 		id: uuid(),
// 		timestamp: new Date()
// 	};

// 	store.updateValue(state => ({
// 		...state,
// 		notes: mergeNotes([
// 			{
// 				...newNote,
// 				unconfirmed: true
// 			},
// 			...state.notes
// 		])
// 	}));

// 	await repository.createNote(newNote);

// 	await fetchNotes(store);
// }

// export async function deleteNote(store, noteId) {
// 	store.updateValue(state => ({
// 		...state,
// 		notes: reject(note => note.id === nodeId, state.notes)
// 	}));

// 	await repository.deleteNote(noteId);

// 	await fetchNotes(store);
// }

// export function enableInstall(store, installEnabled) {
// 	store.updateValue(state => ({
// 		...state,
// 		installEnabled
// 	}));
// }