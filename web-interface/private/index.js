const Koa = require('koa');
const compress = require('koa-compress');
const Router = require('koa-router');
const serve = require('koa-static');
const path = require('path');
const app = new Koa();
const router = new Router();

const {data, limits} = require('./data');
const initDataSocket = require('./data-ws');
const initDataStream = require('./data-stream');

function start(db) {
	router.get('/data', data(db));
	router.get('/limits', limits(db));

	app.use(compress());
	app.use(serve(path.join(__dirname, '../public')));
	app.use(router.routes());

	app.listen(8080);

	initDataSocket(initDataStream(db));

	console.log('Listening on port 8080');

}

module.exports = {start};