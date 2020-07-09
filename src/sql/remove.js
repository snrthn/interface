
// 导入连接配置

var conn = require('../sql/connect');

module.exports = function (options, callback) {

	console.log(options);

	var db = conn(options.dataname);

	var sqlCode = 'DELETE FROM ' + options.tablename + ' WHERE ID = ' + options.query.id;

	db.query(sqlCode, function (err, data) {

		if (callback && typeof callback === 'function') {

			callback(err, data);

		}

	})
}