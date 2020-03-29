import React from 'react';
import { useState } from './store';

import Thermometers from './Thermometers';
import Icon from './Icon';

export default function App() {
	const {fetchingData, error} = useState();

	return error
		? <span>{error.toString()}</span>
		: <>
			<div className="icon-wrapper">
				<Icon iconName="sync" spinning={true} paused={!fetchingData}/>
			</div>
			<Thermometers/>
		</>;
}
