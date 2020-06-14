import React from 'react';
import classNames from 'classnames';

export default function Icon({iconName, spinning, paused}) {
	return <svg className={classNames('icon', { spinning, paused })}>
		<use xlinkHref={`/fa-bundle.svg#${iconName}`}></use>
	</svg>;
}