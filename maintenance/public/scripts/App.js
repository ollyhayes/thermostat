import React from 'react';
// import { useState } from './store';

import Thermometers from './Thermometers';
import Backups from './Backups';

export default function App() {

	return <>
		<Header/>
		<Thermometers/>
		<Backups/>
	</>;
}

function Header() {
	const header = `    __  ___      _       __                                      ____             __        __
   /  |/  /___ _(_)___  / /____  ____  ____ _____  ________     / __ \\____  _____/ /_____ _/ /
  / /|_/ / __ \`/ / __ \\/ __/ _ \\/ __ \\/ __ \`/ __ \\/ ___/ _ \\   / /_/ / __ \\/ ___/ __/ __ \`/ / 
 / /  / / /_/ / / / / / /_/  __/ / / / /_/ / / / / /__/  __/  / ____/ /_/ / /  / /_/ /_/ / /  
/_/  /_/\\__,_/_/_/ /_/\\__/\\___/_/ /_/\\__,_/_/ /_/\\___/\\___/  /_/    \\____/_/   \\__/\\__,_/_/   
																															 `;

	return <div className="header">
		<pre style={{color: 'red'}}>{header}</pre>
	</div>;
}