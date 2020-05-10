const {start} = require('./index');
const config = require('../../common/config.json');

start(config.maintenance.port);