// 导入连接配置

var conn = require('../sql/connect');

module.exports = function (options, callback) {

	var db = conn(options.dataname);

	// 从 options.query 中解构查询参数
	var queryParams = options.query || {};
	
	// 处理逻辑删除过滤 - 通过参数控制
	var includeDeleted = options.include_deleted === true;
	
	// 执行查询的辅助函数
	function executeQuery(checkIsDeleted) {
		// 构建基础SQL语句
		var sqlCode = 'SELECT * FROM ' + options.tablename;
		var params = [];
		var whereConditions = [];
		
		// 默认过滤已删除数据，除非明确指定包含
		// 只有当 checkIsDeleted 为 true 时才添加 is_deleted 条件
		if (!includeDeleted && checkIsDeleted) {
			whereConditions.push('(is_deleted = 0 OR is_deleted IS NULL)');
		}
	
		// 处理查询条件
		if (Object.keys(queryParams).length > 0) {
		
		for (var key in queryParams) {
			var value = queryParams[key];
			
			// 跳过特殊参数（这些不是数据库字段，用于排序和分页）- 兜底处理
			if (key === 'orderBy' || key === 'orderDirection' || key === 'pageSize' || key === 'pageNumber') {
				continue;
			}
			
			// 跳过空值
			if (value === null || value === undefined || value === '') {
				continue;
			}
			
			// 处理特殊查询条件
			if (key.endsWith('_like')) {
				// 模糊查询
				var fieldName = key.replace('_like', '');
				whereConditions.push(fieldName + ' LIKE ?');
				params.push('%' + value + '%');
			} else if (key.endsWith('_gt')) {
				// 大于查询
				var fieldName = key.replace('_gt', '');
				whereConditions.push(fieldName + ' > ?');
				params.push(value);
			} else if (key.endsWith('_lt')) {
				// 小于查询
				var fieldName = key.replace('_lt', '');
				whereConditions.push(fieldName + ' < ?');
				params.push(value);
			} else if (key.endsWith('_gte')) {
				// 大于等于查询
				var fieldName = key.replace('_gte', '');
				whereConditions.push(fieldName + ' >= ?');
				params.push(value);
			} else if (key.endsWith('_lte')) {
				// 小于等于查询
				var fieldName = key.replace('_lte', '');
				whereConditions.push(fieldName + ' <= ?');
				params.push(value);
			} else if (key.endsWith('_in')) {
				// IN查询
				var fieldName = key.replace('_in', '');
				if (Array.isArray(value)) {
					var placeholders = value.map(() => '?').join(',');
					whereConditions.push(fieldName + ' IN (' + placeholders + ')');
					params.push(...value);
				}
			} else if (key.endsWith('_not_in')) {
				// NOT IN查询
				var fieldName = key.replace('_not_in', '');
				if (Array.isArray(value)) {
					var placeholders = value.map(() => '?').join(',');
					whereConditions.push(fieldName + ' NOT IN (' + placeholders + ')');
					params.push(...value);
				}
			} else {
				// 精确匹配查询
				whereConditions.push(key + ' = ?');
				params.push(value);
			}
		}
	}
	
		// 添加WHERE子句
		if (whereConditions.length > 0) {
			sqlCode += ' WHERE ' + whereConditions.join(' AND ');
		}

		// 处理排序 - 从 queryParams 中获取
		if (queryParams.orderBy) {
			sqlCode += ' ORDER BY ' + queryParams.orderBy;
			if (queryParams.orderDirection) {
				sqlCode += ' ' + (queryParams.orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
			}
		}

		// 处理分页 - 从 queryParams 中获取 pageSize 和 pageNumber
		if (queryParams.pageSize) {
			var pageSize = parseInt(queryParams.pageSize);
			var pageNumber = parseInt(queryParams.pageNumber) || 1;
			var offset = (pageNumber - 1) * pageSize;
			
			sqlCode += ' LIMIT ' + pageSize;
			if (offset > 0) {
				sqlCode += ' OFFSET ' + offset;
			}
		}

		console.log('执行SQL:', sqlCode);
		console.log('参数:', params);

		// 执行查询
		db.query(sqlCode, params, function (err, data) {
			// 如果是因为 is_deleted 字段不存在而报错，则重试不带该条件的查询
			if (err && checkIsDeleted && err.message && (
				err.message.indexOf('is_deleted') !== -1 || 
				err.message.indexOf('Unknown column') !== -1 ||
				err.code === 'ER_BAD_FIELD_ERROR'
			)) {
				// 重新执行查询，这次不检查 is_deleted 字段
				executeQuery(false);
			} else {
				// 正常回调或错误回调
				if (callback && typeof callback === 'function') {
					callback(err, data);
				}
			}
		});
	}
	
	// 先尝试带 is_deleted 条件的查询（如果不需要包含已删除数据）
	if (!includeDeleted) {
		executeQuery(true);
	} else {
		executeQuery(false);
	}

}