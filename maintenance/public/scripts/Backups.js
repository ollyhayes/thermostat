import React, { useEffect, useState as useStateReact, useCallback } from 'react';
import { useState } from './store';
import { line } from 'd3-shape';
import { select } from 'd3-selection';
import { axisLeft, axisBottom } from 'd3-axis';
import { scaleTime, scaleLinear } from 'd3-scale';
import multiFormat from '../../../web-interface/public/scripts/time-format';
import moment from 'moment';
import Panel from './Panel';

// const specifier = '%Y-%m-%d %H:%M:%S';
const formatTime = time => time && moment(time).format('Do MMM HH:mm');
// const formatTime = time => moment(time).format('Mo MMM YYYY HH:mm');

export default function Backups() {
	const {backups: {backups, error}} = useState();
	const [logToPreview, setLogToPreview] = useStateReact(null);

	function renderError() {
		return <div>
			{error
				? <span>Error loading data: {error.toString()}</span>
				: <span>Loading...</span>}
		</div>;
	}

	function renderBackups() {
		return <>
			<table>
				<thead>
					<tr>
						{/* <th className="redundant">target</th> */}
						<th>t<sub>0</sub></th>
						<th className="redundant">t<sub>n</sub> - t<sub>0</sub></th>
						<th>n</th>
						<th>r<sub>max</sub></th>
						<th>size</th>
						<th className="graph">Graph</th>
					</tr>
				</thead>
				<tbody>
					{backups.map((log, index) =>
						<React.Fragment key={index}>
							<tr
								className={log === logToPreview ? 'selected' : ''}
								// style={{color: log.target === 'dev' ? 'green' : 'red'}}
								onClick={() => setLogToPreview(log === logToPreview ? null : log)}>
								{/* <td className="redundant">{log.target}</td> */}
								<td>{formatTime(log.startTime)}</td>
								<td className="redundant numeric">{moment.duration(moment(log.startTime).diff(log.endTime)).humanize()}</td>
								<td className="numeric">{log.requests.length}</td>
								<td className="numeric">{log.maxDuration / 1000 + 's'}</td>
								<td className="numeric">{formatSize(log.transferred)}</td>
								<td className="graph"><Chart log={log} aspectRatio={12}/></td>
							</tr>
							{
								logToPreview === log
									? <tr key={-index} className="chart-preview">
										<td colSpan="999">
											<Chart log={log} aspectRatio={3} showAxes={true}/>
										</td>
									</tr>
									: null
							}
						</React.Fragment>
					)}
				</tbody>
			</table>
		</>;
	}

	return <Panel name="Backups" className="backups">
		{backups
			? renderBackups()
			: renderError()}
	</Panel>;
}

function Chart({log, aspectRatio, showAxes}) {
	// eg 1920x1080, aR = 1.777
	// 1000x100, aR = 10

	const [{path, xAxis, yAxis}, setData] = useStateReact({path: null, xAxis: null, yAxis: null});
	const xAxisRef = useCallback(node => node && xAxis && select(node).call(xAxis), [xAxis]);
	const yAxisRef = useCallback(node => node && yAxis && select(node).call(yAxis), [yAxis]);

	const height = 250;
	const width = height * aspectRatio;

	const margin = showAxes 
		? {
			left: 35,
			right: 4,
			top: 4,
			bottom: 18
		}
		: {
			left: 4,
			right: 4,
			top: 4,
			bottom: 4
		};
	margin.height = height + margin.top + margin.bottom;
	margin.width = width + margin.left + margin.right;

	useEffect(() => {
		const xScale = scaleTime()
			.domain([log.startTime, log.endTime])
			.range([0, width]);
		const yScale = scaleLinear()
			.domain([0, log.maxDuration])
			.range([height, 0]);

		const lineGenerator = line()
			.x(d => xScale(d.requestTime))
			.y(d => yScale(d.requestDuration));
		const requests = stepifyArray(log.requests);
		const path = lineGenerator(requests);

		if (showAxes) {
			const xAxis = axisBottom(xScale)
				.tickFormat(multiFormat);
			const yAxis = axisLeft(yScale)
				.tickFormat(ms => `${ms / 1000}s`);

			setData({path, xAxis, yAxis});
		} else {
			setData({path});
		}
	}, [log]);

	return <div className="backup-graph">
		<svg viewBox={`${-margin.left} ${-margin.top} ${margin.width} ${margin.height}`}>
			<path className="graph-path" d={path}/>
			<g ref={xAxisRef} className="x-axis" transform={`translate(0, ${height})`}></g>
			<g ref={yAxisRef} className="y-axis"></g>
		</svg>
	</div>;
}

function stepifyArray(input) {
	const output = [];
	for (let i = 0; i < input.length; i++) {
		output[i * 2] = input[i];

		if (input[i + 1])
			output[i * 2 + 1] = {
				requestTime: input[i + 1].requestTime,
				requestDuration: input[i].requestDuration
			};
	}
	return output;
}

function formatSize(value){
	if (!value)
		return 0 + 'b';

	if (value < 1000)
		return value + 'b';

	value = divide(value);

	if (value < 1000)
		return value + 'kb';

	value = divide(value);

	if (value < 1000)
		return value + 'mb';

	value = divide(value);

	if (value < 1000)
		return value + 'gb';

	value = divide(value);

	if (value < 1000)
		return value + 'tb';

	function divide(number)
	{
		number /= 1000;

		return Math.round(number * 10) / 10;
	}
}