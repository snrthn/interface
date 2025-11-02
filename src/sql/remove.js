// 导入连接配置

var conn = require('../sql/connect');

module.exports = function (options, callback) {

	console.log(options);

	var db = conn(options.dataname);

	// 检查是否使用逻辑删除
	var useLogicalDelete = options.logical_delete !== false; // 默认为 true

	var sqlCode;
	var params = [];

	if (useLogicalDelete) {
		// 逻辑删除：更新 is_deleted 和 deleted_at 字段
		sqlCode = 'UPDATE ' + options.tablename + ' SET is_deleted = 1, deleted_at = NOW() WHERE ID = ?';
		params = [options.query.id];
	} else {
		// 物理删除：直接删除记录
		sqlCode = 'DELETE FROM ' + options.tablename + ' WHERE ID = ?';
		params = [options.query.id];
	}

	db.query(sqlCode, params, function (err, data) {

		if (callback && typeof callback === 'function') {

			callback(err, data);

		}

	})

}