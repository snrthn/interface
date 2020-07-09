
// 导入连接配置

var conn = require('../sql/connect');

module.exports = function (options, callback) {

	var db = conn(options.dataname);

	var keys = Object.keys(options.data).join(', ');

	var values = '"' + Object.values(options.data).join('","') + '"';

	var updStr = '';

	for (var key in options.data) {
		if (key !== 'id') updStr += '' + key + '' + '=' + '"' + options.data[key] + '", ';
	}

	updStr = updStr.replace(/, $/, ' ');

	updStr += 'WHERE ID = ' + '"' + options.data.id + '"';

	var sqlCode = 'UPDATE ' + options.tablename + ' SET ' + updStr;

	db.query(sqlCode, function (err, data) {

		if (callback && typeof callback === 'function') {

			callback(err, data);

		}

	})
}