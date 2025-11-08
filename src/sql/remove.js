// 导入连接配置

var conn = require('../sql/connect');

module.exports = function (options, callback) {

	console.log(options);

	var db = conn(options.dataname);

	// 检查是否使用逻辑删除
	var useLogicalDelete = options.logical_delete !== false; // 默认为 true

	// 构建 WHERE 子句：优先使用 options.query，如果没有则使用 options.data.id
	var whereStr = '';
	var params = [];
	
	if (options.query && Object.keys(options.query).length > 0) {
		// 使用 options.query 构建 WHERE 条件
		var whereConditions = [];
		for (var queryKey in options.query) {
			var queryValue = options.query[queryKey];
			if (queryValue === null || queryValue === undefined) {
				whereConditions.push('`' + queryKey + '` IS NULL');
			} else {
				whereConditions.push('`' + queryKey + '` = ?');
				params.push(queryValue);
			}
		}
		whereStr = 'WHERE ' + whereConditions.join(' AND ');
	} else if (options.data && options.data.id) {
		// 备用方案：使用 options.data.id
		whereStr = 'WHERE `id` = ?';
		params = [options.data.id];
	} else {
		// 如果没有 WHERE 条件，返回错误
		if (callback && typeof callback === 'function') {
			callback(new Error('DELETE 操作必须提供 WHERE 条件（options.query 或 options.data.id）'), null);
		}
		return;
	}

	var sqlCode;
	if (useLogicalDelete) {
		// 逻辑删除：更新 is_deleted 和 deleted_at 字段
		sqlCode = 'UPDATE `' + options.tablename + '` SET `is_deleted` = 1, `deleted_at` = NOW() ' + whereStr;
	} else {
		// 物理删除：直接删除记录
		sqlCode = 'DELETE FROM `' + options.tablename + '` ' + whereStr;
	}

	db.query(sqlCode, params, function (err, data) {

		if (callback && typeof callback === 'function') {

			callback(err, data);

		}

	})

}