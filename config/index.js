
// 服务器配置

let dataConfig = require('./database');

let config = {

	// 服务器端口号
	port: 8004,

	// 首页欢迎语
	indexMsg: 'Hello World!',

	// 地址不存在提示语
	errMsg: '请求地址不存在 - 404'

};

module.exports = {...config, ...dataConfig};