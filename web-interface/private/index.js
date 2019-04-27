const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const path = require('path');
const app = new Koa();
const router = new Router();

const data = require('./data');

function start(db) {
	router.get('/data', data(db));

	app.use(serve(path.join(__dirname, '../public')));
	app.use(router.routes());

	app.listen(8080);

	console.log('Listening on port 8080');
}

module.exports = {start};