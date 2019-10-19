import '../less/page.less';
import React from 'react';
import ReactDOM from 'react-dom';
import drawChart from './drawChart';
import Legend from './Legend';

import initialiseDataSocket from './data-socket';
import createChunkStore from './chunk-store';
import { getChunkContaining, getChunksForDateRange } from './chunk-utils';
import createChunkSet from '../../private/chunk-set';

const {getData, storeData, dropData} = createChunkStore();

document.addEventListener('DOMContentLoaded', async () => {
	let isReady = false;
	const requestChunks = initialiseDataSocket(handleNewData);
	const chunkSet = createChunkSet(50, dropChunk);

	const root = document.querySelector('.root');
	const redraw = await drawChart(root, requestData);
	isReady = true;

	// Should probably make a common react root
	ReactDOM.render(
		<Legend></Legend>,
		document.querySelector('.react-root'));

	function requestData(domain) {
		const chunks = getChunksForDateRange(...domain);

		requestChunks(chunks.filter(chunk => !chunkSet.has(chunk)));

		return getData(...domain, chunks[0].precisionLevel);
	}

	function handleNewData(chunk, temperatures) {
		if (chunk.special) {
			chunk = {
				...chunk,
				...getChunkContaining(new Date(), chunk.precisionLevel)
			};

			if (chunk.precisionLevel === 0) {
				ReactDOM.render(
					<Legend 
						currentTemperatures={temperatures} 
						dataTime={new Date()}
						triggerRedraw={redraw}
					></Legend>,
					document.querySelector('.react-root'));
			}
		} else {
			chunkSet.add(chunk);
		}

		storeData(temperatures, chunk.precisionLevel);

		// don't redraw if special chunk isn't in view?
		if (isReady)
			redraw();
	}

	function dropChunk(chunkCode) {
		dropData(
			new Date(+chunkCode.substring(0, 13)),
			new Date(+chunkCode.substring(13, 26)),
			+chunkCode.substring(26, 27));
	}
});
