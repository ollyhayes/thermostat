import React from 'react';
import { useState } from './store';
import classNames from 'classnames';

import Thermometers from './Thermometers';
import Backups from './Backups';
import { selectPanel } from './actions';

export default function App() {
	const {selectedPanel} = useState();

	const SelectedPanel = {
		'backups': Backups,
		'thermometers': Thermometers
	}[selectedPanel] || (() => <span>Unknown panel</span>);

	return <>
		<Header/>
		<Menu/>
		<SelectedPanel/>
	</>;
}

function Menu() {
	const {store, selectedPanel} = useState();

	function renderButton(text, panelName) {
		return <button
			onClick={() => selectPanel(store, panelName)}
			className={classNames({selected: panelName === selectedPanel})}>
			{text}
		</button>;
	}

	return <div className="menu">
		{renderButton('Connected Thermometers', 'thermometers')}
		{renderButton('Backups', 'backups')}
		{renderButton('Raspberry-Pi functions', 'raspberry-functions')}
		{renderButton('pump', 'pump')}
	</div>;
}

function Header() {
	const header = `    __  ___      _       __
   /  |/  /___ _(_)___  / /____  ____  ____ _____  ________
  / /|_/ / __ \`/ / __ \\/ __/ _ \\/ __ \\/ __ \`/ __ \\/ ___/ _ \\
 / /  / / /_/ / / / / / /_/  __/ / / / /_/ / / / / /__/  __/
/_/  /_/\\__,_/_/_/ /_/\\__/\\___/_/ /_/\\__,_/_/ /_/\\___/\\___/`;

	const underline = '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~';

	return <div className="header">
		<pre style={{color: 'red'}}>{header}</pre>
		<pre style={{color: 'cyan'}}>{underline}</pre>
	</div>;
}