
// 导入连接配置

var conn = require('../sql/connect');

module.exports = function (basename, callback) {

	var sqlCode = 'SELECT * FROM student';

	var db = conn(basename);

	db.query(sqlCode, function (err, data) {

		if (callback && typeof callback === 'function') {
			callback(err, data);
		}

	})
}