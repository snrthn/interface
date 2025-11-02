
// 连接数据库

let mysql = require('mysql');

let conf = require('./../../config');

if (!global.dbList) global.dbList = [] // 连接池数量

// 连接池管理：超过10个连接池时清理最旧的
if (global.dbList?.length >= 10) {
	// 清理最旧的连接池（保留最新的5个）
	var keepCount = 5;
	var poolsToRemove = global.dbList.slice(0, global.dbList.length - keepCount);
	
	poolsToRemove.forEach(pool => {
		pool.dbPoll.end();
	});
	
	// 保留最新的连接池
	global.dbList = global.dbList.slice(-keepCount);
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
		curPoll = mysql.createPool({
			host: conf.dataHost,
			port: conf.dataPort,
			user: conf.user,
			password: conf.password,
			database: database || conf.database,
			charset: conf.charset,
			timezone: '+08:00',
			dateStrings: true,
			// 连接池配置
			connectionLimit: 10,        // 最大连接数
			acquireTimeout: 60000,      // 获取连接超时时间
			timeout: 60000,             // 查询超时时间
			reconnect: true,            // 自动重连
			idleTimeout: 300000,        // 空闲连接超时时间（5分钟）
			queueLimit: 0               // 队列限制（0表示无限制）
		})

		global.dbList.push({
			dbName: database || conf.database,
			dbPoll: curPoll
		})
	}


	return curPoll
};