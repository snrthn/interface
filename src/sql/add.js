
// 导入连接配置

var conn = require('../sql/connect');

module.exports = function (options, callback) {

	var db = conn(options.dataname);

	var keys = Object.keys(options.data).join(', ');

	// 正确处理所有数据类型，避免 [object Object] 问题
	var values = [];
	for (var key in options.data) {
		var value = options.data[key];
		// 处理 NULL 值
		if (value === null || value === undefined) {
			values.push('NULL');
		} else {
			// 确保值是基本类型（字符串、数字、布尔值）
			var stringValue = String(value);
			// 转义单引号，防止 SQL 注入
			stringValue = stringValue.replace(/'/g, "''");
			values.push("'" + stringValue + "'");
		}
	}
	var valuesStr = values.join(', ');

	var sqlCode = 'INSERT INTO `' + options.tablename + '` (' + keys + ') VALUES (' + valuesStr + ')';

	db.query(sqlCode, function (err, data) {

		if (callback && typeof callback === 'function') {

			callback(err, data);

		}

	})
}