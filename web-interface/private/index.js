const http = require('http');
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
const port = 8081;

function start(db, newDataEmitter = []) {
	router.get('/data', data(db));
	router.get('/limits', limits(db));

	app.use(compress());
	app.use(serve(path.join(__dirname, '../public')));
	app.use(router.routes());

	const server = http.createServer(app.callback());
	server.listen(port);

	initDataSocket(server, initDataStream(db, newDataEmitter));

	console.log(`Listening on port ${port}`);

}

module.exports = {start};