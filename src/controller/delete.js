// 文件上传写入模板

var path = require('path');

const methods = 'post';

module.exports = async function (req, res, query, data) {

    if (req.method.toLocaleLowerCase() !== methods.toLocaleLowerCase()) {
        res.writeHead(405, global.headerConfig); // 写入错误请求头

        // 返回异常响应体
        return global.httpCode[405];
    }
	
	// 检测文件
	if (!data.filepath) {
		// 上传文件为空
		return {
			state: 200,
			success: true,
			data: {
				filepath: []
			},
			message: '文件路径为空!'
		}
	}

	// 写入文件
	const fileInfo = await global.deleteFile({ data });

	// 返回结果
	return fileInfo;
}