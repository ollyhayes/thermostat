import React from 'react';
import { useState } from './store';

import Thermometers from './Thermometers';

export default function App() {
	const {error} = useState();

	return error
		? <span>{error.toString()}</span>
		: <Thermometers/>;
}
