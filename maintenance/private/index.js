const http = require('http');
const Koa = require('koa');
const compress = require('koa-compress');
const Router = require('koa-router');
const serve = require('koa-static');
const path = require('path');
const {data} = require('./data');
const app = new Koa();
const router = new Router();

const port = 8081;

// function start() {

router.get('/data', data());
// router.get('/limits', limits(db));

app.use(compress());
app.use(serve(path.join(__dirname, '../public')));
app.use(router.routes());

const server = http.createServer(app.callback());
server.listen(port);

console.log(`Listening on port ${port}`);

// }

// module.exports = {start};