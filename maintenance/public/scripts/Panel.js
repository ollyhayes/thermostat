import React from 'react';

export default function Panel({name, children}) {
	return <div className="panel">
		{name && <header>{name}</header>}
		{children}
	</div>;
}