import React from 'react';
// import { useState } from './store';

import Thermometers from './Thermometers';
import Backups from './Backups';

export default function App() {

	return <>
		<Header/>
		<Backups/>
		<Thermometers/>
	</>;
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