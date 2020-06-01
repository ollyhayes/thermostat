import React from 'react';

export default function Panel({name, className, children}) {
	return <div className={`panel ${className}`}>
		{name && <header>{name}</header>}
		{children}
	</div>;
}