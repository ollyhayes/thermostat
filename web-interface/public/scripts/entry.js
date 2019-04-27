import '../less/page.less';
import drawChart from './drawChart';

document.addEventListener('DOMContentLoaded', () =>
{
	const root = document.querySelector('.root');
	drawChart(root);
});
