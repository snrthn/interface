
// 引入配置
var config = require('../../config');

var path = require('path');

// 引入 SQL 基础库
module.exports = {
	connect: require('./connect'),
	add: require('./add'),
	remove: require('./remove'),
	update: require('./update'),
	query: require('./query')
}