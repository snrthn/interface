
// 服务器配置

let mimeConfig = require('./mime');
let dataConfig = require('./database');
let headerConfig = require('./headers');
let httpCode = require('./httpcode');

let config = {

	// 服务器端口号
	port: 8004,

	// 首页欢迎语
	indexMsg: 'Hello World!',

	// 地址不存在提示语
	errMsg: JSON.stringify({
		code: 404,
		msg: "请求地址不存在"
	}),

	// 默认上传文件目录
	uploadDir: '../upload',

	// 静态资源目录
	staticDir: './src/static',

	// 上传文件访问域名路径
	fileOrigin: 'https://www.xxx.com/files',

	// 是否需要缓存
	isCache: false

};

module.exports = {
	headerConfig,
	mimeConfig,
	httpCode,
	...config,
	...dataConfig
};