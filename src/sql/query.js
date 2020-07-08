
// 导入连接配置

var conn = require('../sql/connect');

module.exports = function (options, callback) {

	var db = conn(options.dataname);

	var sqlCode = 'SELECT * FROM ' + options.tablename;

	db.query(sqlCode, function (err, data) {

		if (callback && typeof callback === 'function') {

			callback(err, data);

		}

	})
}