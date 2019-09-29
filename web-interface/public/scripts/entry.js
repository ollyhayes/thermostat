import '../less/page.less';
import * as React from "react";
import * as ReactDOM from "react-dom";
import drawChart from './drawChart';
import Legend from './Legend';

import DataWorker from './data.worker.js';
import createChunkStore from './chunk-store';
import {
	flattenChunks,
	getChunksForDateRange,
	createChunksChangedCalculator,
	getChunkContaining
} from './chunk-utils';
const dataWorker = new DataWorker();

if ('ontouchstart' in window)
	document.addEventListener('touchstart', () => {});

document.addEventListener('DOMContentLoaded', () => {

	const root = document.querySelector('.root');
	drawChart(root);

	// Should probably make a common react root
	ReactDOM.render(
		<Legend></Legend>,
		document.querySelector('.react-root'));
});