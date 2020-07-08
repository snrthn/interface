
module.exports = function (req, res, query, data) {

	console.log(req.method);

	let options = {
		dataname: 'stu',
		tablename: 'student',
		query: query,
		data: data
	};

	switch (req.method) {
		case 'GET':
			getData(options, res);
			break;
		case 'POST':
			addData (options, res);
			break;
		case 'PUT':
			updateData (options, res);
			break;
		case 'DELETE':
			removeData (options, res);
			break;
	}
}

// 查询数据
function getData (options, res) {
	database.query(options, function (err, data) {
		if (!err) {
			res.write(JSON.stringify({
				status: 200,
				success: true,
				message: '查询成功',
				list: data
			}));
		} else {
			res.write(JSON.stringify({
				status: 500,
				success: false,
				message: err.message,
			}));
		}
		res.end();
	})
};

// 新增数据
function addData (options, res) {
	database.add(options, function (err, data) {
		if (!err) {
			res.write(JSON.stringify({
				status: 200,
				success: true,
				message: '添加成功'
			}));
		} else {
			res.write(JSON.stringify({
				status: 500,
				success: false,
				message: err.message,
			}));
		}
		res.end();
	})
};

// 修改数据
function updateData (options, res) {
	console.log('您大爷');
	database.update(options, function (err, data) {
		if (!err) {
			res.write(JSON.stringify({
				status: 200,
				success: true,
				message: '更新成功'
			}));
		} else {
			res.write(JSON.stringify({
				status: 500,
				success: false,
				message: err.message,
			}));
		}
		res.end();
	})
};

// 删除数据
function removeData (options, res) {
	database.update(options, function (err, data) {
		if (!err) {
			res.write(JSON.stringify({
				status: 200,
				success: true,
				message: '删除成功'
			}));
		} else {
			res.write(JSON.stringify({
				status: 500,
				success: false,
				message: err.message,
			}));
		}
		res.end();
	})
};