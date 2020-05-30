import React from 'react';

export default function Panel({name, children}) {
	return <div className="panel">
		<header>{name}</header>
		{children}
	</div>;
}