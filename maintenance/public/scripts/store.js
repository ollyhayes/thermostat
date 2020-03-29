import React, {useReducer, useContext, useEffect} from 'react';

const StoreContext = React.createContext();

export function Provider({children, store}) {
	return <StoreContext.Provider value={store}>
		{children}
	</StoreContext.Provider>;
}

export function useState() {
	const [, forceRender] = useReducer(s => s + 1, 0);
	const store = useContext(StoreContext);

	useEffect(() => {
		const subscription = store.subscribe(() => forceRender());
		return () => store.unsubscribe(subscription);
	}, []);

	return store.getValue();
}

export function useStore() {
	return useContext(StoreContext);
}

export function createStore(initialState) {
	const subscriptions = new Set();
	let value = initialState;
	return {
		subscribe(callback) {
			subscriptions.add(callback);
			return callback;
		},
		unsubscribe(callback) {
			subscriptions.delete(callback);
		},
		getValue() {
			return value;
		},
		updateValue(update) {
			value = update(value);
			subscriptions.forEach(subscription =>
				subscription(value));
		}
	};
}