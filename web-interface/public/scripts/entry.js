import '../less/page.less';
import React from 'react';
import ReactDOM from 'react-dom';
import drawChart from './drawChart';
import Legend from './Legend';

import DataWorker from './data.worker.js';
import createChunkStore from './chunk-store';
import { getChunkContaining, getChunksForDateRange } from './chunk-utils';

const dataWorker = new DataWorker();
const {getData, storeData} = createChunkStore();

if ('ontouchstart' in window)
	document.addEventListener('touchstart', () => {});

document.addEventListener('DOMContentLoaded', async () => {

	const root = document.querySelector('.root');
	const redraw = await drawChart(root, requestData);
	
	dataWorker.addEventListener('message', handleNewData);

	// Should probably make a common react root
	ReactDOM.render(
		<Legend></Legend>,
		document.querySelector('.react-root'));

	function requestData(domain) {
		const chunks = getChunksForDateRange(...domain);

		// const missingChunks = getMissingChunks(chunks);
		// if (missingChunks.length)
		dataWorker.postMessage(chunks);

		return getData(...domain, chunks[0].precisionLevel);
	}

	function handleNewData({data: {chunk, temperatures}}) {
		if (chunk.special) {
			chunk = {
				...chunk,
				...getChunkContaining(new Date(), chunk.precisionLevel)
			};

			if (chunk.precisionLevel === 0) {
				ReactDOM.render(
					<Legend currentTemperatures={chunk.thermometers}></Legend>,
					document.querySelector('.react-root'));
			}
		}

		storeData(temperatures, chunk.precisionLevel);

		// don't redraw if special chunk isn't in view?
		redraw();
	}
});