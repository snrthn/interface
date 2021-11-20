// 文件上传写入模板

var path = require('path');
var fs = require('fs');

module.exports = function (req, res, query, data) {
	// 写入文件
	global.writeFile({
		data,
		// uploadDir: path.resolve(__dirname, 'D:/Website/files'), // 文件上传到哪，不传该参数文件被放至全局配置的目录中
		// fileOrigin: 'https://www.xxx.com/files', // 拼接上传域名的访问前缀，不传该参数文件被放至全局配置的目录中
		success (fileInfo) {
			res.write(JSON.stringify({
				state: 200,
				success: true,
				data: {
					urls: fileInfo
				},
				message: '文件上传成功!'
			}));
			res.end();
		}
	});
}