// 这是一个DEMO控制器
module.exports = function (req, res, query, data, json) {
	res.write(JSON.stringify({query, data, json}));
	res.end();
};