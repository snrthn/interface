// 文件上传写入模板

var path = require('path');

module.exports = async function (req, res, query, data) {
	
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
			urls: fileInfo
		},
		message: '文件上传成功!'
	};
}