
// 导入连接配置

var conn = require('../sql/connect');

module.exports = function (options, callback) {

	var db = conn(options.dataname);

	var keys = Object.keys(options.data).join(', ');

	var values = '"' + Object.values(options.data).join('","') + '"';

	var sqlCode = 'INSERT INTO ' + options.tablename + ' (' + keys + ') VALUES (' + values + ')';

	console.log(sqlCode);

	db.query(sqlCode, function (err, data) {

		if (callback && typeof callback === 'function') {

			callback(err, data);

		}

	})
}