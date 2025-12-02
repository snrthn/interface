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
	if (!data.file) {
		// 上传文件为空
		return {
			state: 200,
			success: true,
			data: {
				urls: []
			},
			message: '选择文件为空!'
		}
	}

	// 写入文件
	const fileInfo = await global.writeFile({ data });

	// 返回结果
	return {
		state: 200,
		success: true,
		data: {
			urls: fileInfo.file
		},
		message: '文件上传成功!'
	};
}// 文件上传写入模板

var path = require('path');

const methods = 'post';

module.exports = async function (req, res, query, data) {

    if (req.method.toLocaleLowerCase() !== methods.toLocaleLowerCase()) {
        res.writeHead(405, global.headerConfig); // 写入错误请求头

        // 返回异常响应体
        return global.httpCode[405];
    }
	
	// 检测文件
	if (!data.file) {
		// 上传文件为空
		return {
			state: 200,
			success: true,
			data: {
				urls: []
			},
			message: '选择文件为空!'
		}
	}

	// 写入文件
	const fileInfo = await global.writeFile({ data });

	// 返回结果
	return {
		state: 200,
		success: true,
		data: {
			urls: fileInfo.file
		},
		message: '文件上传成功!'
	};
}