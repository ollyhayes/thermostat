import '../less/page.less';
import React from 'react';
import ReactDOM from 'react-dom';
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
const {getChunks: getChunkData, storeChunk, getMissingChunks} = createChunkStore();

if ('ontouchstart' in window)
	document.addEventListener('touchstart', () => {});

document.addEventListener('DOMContentLoaded', async () => {

	const root = document.querySelector('.root');
	const redraw = await drawChart(root, requestChunks);
	
	dataWorker.addEventListener('message', handleNewData);

	// Should probably make a common react root
	ReactDOM.render(
		<Legend></Legend>,
		document.querySelector('.react-root'));

	function requestChunks(chunks) {
		const missingChunks = getMissingChunks(chunks);
		if (missingChunks.length)
			dataWorker.postMessage(missingChunks);

		return getChunkData(chunks);
	}

	function handleNewData({data: chunk}) {
		if (chunk.special) 
			chunk = {
				...chunk,
				...getChunkContaining(new Date(), chunk.precisionLevel)
			};

		const otherChunksWereMutated = storeChunk(chunk);

		redraw(otherChunksWereMutated);
	}
});