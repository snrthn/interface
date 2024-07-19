
// 连接数据库

let mysql = require('mysql');

let conf = require('./../../config');

if (!global.dbList) global.dbList = [] // 连接池数量

if (global.dbList?.length >= 20) { // 超过20条，就直接清空
	global.dbList.forEach(pool => {
		pool.dbPoll.end();
	})
	global.dbList = [];
}

module.exports = function (database) {
	let curPoll = null

	console.log(global.dbList.length);

	// 连接池中是否存在当前的连接
	let findConnect = global.dbList.find(item => [database || conf.database].includes(item.dbName));

	if (findConnect) {
		// 如果存在，则直接返回连接池
		curPoll = findConnect.dbPoll;
	} else {
		// 如果不存在，则重新创建新的连接
		curPoll = mysql.createPool({
			host: conf.dataHost,
			port: conf.dataPort,
			user: conf.user,
			password: conf.password,
			database: database || conf.database,
			charset: conf.charset
		})

		global.dbList.push({
			dbName: database || conf.database,
			dbPoll: curPoll
		})
	}

	return curPoll
};