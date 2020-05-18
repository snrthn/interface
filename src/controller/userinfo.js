// 这是一个USER控制器
module.exports = function (req, res, data) {
	res.write(JSON.stringify(data));
	res.end();
};