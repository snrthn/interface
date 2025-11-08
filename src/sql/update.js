
// 导入连接配置

var conn = require('../sql/connect');

module.exports = function (options, callback) {

	var db = conn(options.dataname);

	var updStr = '';

	// 构建 SET 子句：排除 id 字段（id 不参与更新，只用于 WHERE 条件）
	for (var key in options.data) {
		if (key !== 'id') {
			// 处理 NULL 值
			if (options.data[key] === null || options.data[key] === undefined) {
				updStr += '`' + key + '` = NULL, ';
			} else {
				// 转义单引号，防止 SQL 注入
				var value = String(options.data[key]).replace(/'/g, "''");
				updStr += '`' + key + '` = ' + "'" + value + "', ";
			}
		}
	}

	updStr = updStr.replace(/, $/, ' ');

	// 构建 WHERE 子句：优先使用 options.query，如果没有则使用 options.data.id
	var whereStr = '';
	if (options.query && Object.keys(options.query).length > 0) {
		// 使用 options.query 构建 WHERE 条件
		var whereConditions = [];
		for (var queryKey in options.query) {
			var queryValue = options.query[queryKey];
			if (queryValue === null || queryValue === undefined) {
				whereConditions.push('`' + queryKey + '` IS NULL');
			} else {
				// 转义单引号，防止 SQL 注入
				var escapedValue = String(queryValue).replace(/'/g, "''");
				whereConditions.push('`' + queryKey + '` = ' + "'" + escapedValue + "'");
			}
		}
		whereStr = 'WHERE ' + whereConditions.join(' AND ');
	} else if (options.data.id) {
		// 备用方案：使用 options.data.id
		var idValue = String(options.data.id).replace(/'/g, "''");
		whereStr = 'WHERE `id` = ' + "'" + idValue + "'";
	} else {
		// 如果没有 WHERE 条件，返回错误
		if (callback && typeof callback === 'function') {
			callback(new Error('UPDATE 操作必须提供 WHERE 条件（options.query 或 options.data.id）'), null);
		}
		return;
	}

	var sqlCode = 'UPDATE `' + options.tablename + '` SET ' + updStr + ' ' + whereStr;

	db.query(sqlCode, function (err, data) {

		if (callback && typeof callback === 'function') {

			callback(err, data);

		}

	})
}