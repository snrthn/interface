
// 连接数据库

let mysql = require('mysql');

let conf = require('./../../config');

module.exports = function (database) {
	return mysql.createPool({
		host: conf.dataHost,
		port: conf.dataPort,
		user: conf.user,
		password: conf.password,
		database: database || conf.database,
		charset: conf.charset
	})
};