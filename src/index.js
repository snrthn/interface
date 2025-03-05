﻿var http = require('http');
var path = require('path');
var urlParser = require('url');
var controller = require('./router');
var config = require('../config');
var writeFile = require('./writeFile');
var fs = require('fs');
var qs = require('qs');

/* 创建服务器 */
function initServer () {

	// 定义配置信息
	var options = function () {
		return {
			/* 路由表 */
			routerList: []
		}
	};

	/* 预装载路由表 */
	if (config.isCache) fillRouterTable(options());

	var server = http.createServer(function (req, res) {

		/* 缓存机制 */
		if (!config.isCache) clearRequireCache();

		var host = req.headers.referer && req.headers.referer.substr(0, req.headers.referer.length - 1);

		/* 设置请求头和跨域 */
		global.headerConfig = config.headerConfig[host] || config.headerConfig['common'];
		res.writeHead(200, global.headerConfig);

		/* 初始化数据库 */
		global.database = require('./sql');

		/* 初始化上传配置 */
		global.uploadDir = path.resolve(__dirname, config.uploadDir);
		global.mimeConfig = config.mimeConfig;
		global.fileOrigin = config.fileOrigin;
		global.httpCode = config.httpCode;
		global.writeFile = writeFile;

		if (req.method === 'OPTIONS') {
			res.write('');
			res.end();
		} else {
			/* 如果是静态资源 则直接去静态资源文件夹读取 */
			if (req.url.indexOf('.') !== -1) {
				var url = req.url;
				var extName = url.substr(url.lastIndexOf('.') + 1, url.length - 1);
				if (global.mimeConfig[extName]) {
					fs.readFile(config.staticDir + url, function (err, data) {
						if (!err) {
							/* 处理静态文件 */
							res.writeHead(200, Object.assign({
								'content-type': global.mimeConfig[extName]
							}));
							res.write(data);
							res.end();
						} else {
							/* 处理API请求 */
							handleRequest(req, res, options());
						}
					});
				} else {
					/* 处理API请求 */
					handleRequest(req, res, options());
				}
			} else {
				/* 处理API请求 */
				handleRequest(req, res, options());
			}
		}

	})

	/* 监听端口 */
	server.listen(config.port, function () {
		console.log(config.port + '端口监听中...');
	})
}

/* 处理请求 */
function handleRequest (req, res, options) {

	/* 如果没有缓存 则每次请求需要清除路由表重新取文件 */
	if (!config.isCache) options.routerList = [];

	if (config.isCache) {
		/* 有缓存 */
		forEachRouterTab(req, res, options);
	} else {
		/* 无缓存 */
		fillRouterTable(options, function () {
			forEachRouterTab(req, res, options);
		});
	}
}

/* 填装控制器路由表 */
function fillRouterTable (options, callback) {
	controller(function (filesObj) {

		var { dataCollection, contCollection } = filesObj;

		var dataLen = dataCollection.length;
		var contLen = contCollection.length;

		var temp = [];
		var datExt = '';

		for (var i = 0; i < dataLen; i++) {
			var data = dataCollection[i];
			if (!datExt) datExt = data.substr(data.lastIndexOf('.'), data.length - 1);
			var resDat = data.substr(0, data.lastIndexOf('.'));
			temp.push(resDat);
		}

		for (var i = 0; i < contLen; i++) {
			var cont = contCollection[i];
			var resCon = cont.substr(0, cont.lastIndexOf('.'));
			if (temp.indexOf(resCon) !== -1) {
				options.routerList.push({
					data: resCon + datExt,
					cont
				});
				temp.splice(temp.indexOf(resCon), 1);
			} else {
				options.routerList.push({
					data: null,
					cont
				});
			}
		}

		var tempLen = temp.length;

		for (var i = 0; i < tempLen; i++) {
			options.routerList.push({
				data: temp[i] + datExt,
				cont: null
			})
		}

		if (callback && typeof callback === 'function') callback(options);
	}, options)
}

/* 遍历路由表 */
function forEachRouterTab (req, res, options) {
	/* 取URL参数 */
	var urlObj = urlParser.parse(req.url, true);

	/* 判断是否匹配到 */
	var isNoPage = false;

	/* 处理首页 */
	if (urlObj.pathname === '/') {
		isNoPage = true;
		res.write(config.indexMsg);
		res.end();
		return;
	}

	/* 匹配路由控制表 */
	options.routerList.map(function (item) {
		if (item.data && item.cont && item.data.substr(0, item.data.lastIndexOf('.')) === urlObj.pathname) {
			isNoPage = true;
			postDataFun(req, function (postData) {
				fs.readFile(path.join(__dirname, './controller') + item.cont, function (err, data) {
					if (err) {
						res.write('错误: 控制器 js 文件读取失败!');
						res.end();
					} else {
						var strFun = data.toString();
						try {
							/* 对 utf-8 编码的 JSON 文件进行特殊处理 */
							if (strFun.substr(0, 1).charCodeAt() === 65279) {
								strFun = strFun.substr(1, strFun.length - 1);
							}

							// 控制器为空
							if (strFun.length === 0) {
								res.write('错误: 控制器文件为空!');
								res.end();
							} else {
								var conFun = require(path.join(__dirname, './controller') + item.cont);
								if (conFun && typeof conFun === 'function') {

									// 取 JSON 数据
									fs.readFile(path.join(__dirname, './data') + item.data, async function (err, data) {
										if (err) {
											res.write('错误: 数据 json 文件读取失败!');
											res.end();
										} else {
											var dataStr = data.toString();
											try {
												/* 对 utf-8 编码的 JSON 文件进行特殊处理 */
												if (dataStr.substr(0, 1).charCodeAt() === 65279) {
													dataStr = dataStr.substr(1, dataStr.length - 1);
												}
												/* 检查文件内容是否符合 JSON 规范 */
												var jsonData = JSON.parse(dataStr);

												var json = require(path.join(__dirname, './data') + item.data);

												var result = await conFun(req, res, urlObj.query, postData, json);

												if (!res.finished) {
													try {
														if (typeof result === 'object') {
															res.write(JSON.stringify(result));
														} else {
															res.write(result);
														}
													} catch (err) {
														res.write(JSON.stringify({
															code: 500,
															msg: err
														}))
													}
													res.end();
												}

											} catch (err) {
												res.write('错误: 数据 json 内部不是一个有效的JOSN数据!');
												res.end();
											}
										}
									})
									
								} else {
									res.write('错误: 控制器必须是一个函数!');
									res.end();
								}
							}
						} catch (err) {
							res.write('错误: ' + err.message);
							res.end();
						}
					}
				});
			});
		} else if (item.data && !item.cont && item.data.substr(0, item.data.lastIndexOf('.')) === urlObj.pathname) {
			isNoPage = true;
			postDataFun(req, function (postData) {
				fs.readFile(path.join(__dirname, './data') + item.data, function (err, data) {
					if (err) {
						res.write('错误: 数据 json 文件读取失败!');
						res.end();
					} else {
						var dataStr = data.toString();
						try {
							/* 对 utf-8 编码的 JSON 文件进行特殊处理 */
							if (dataStr.substr(0, 1).charCodeAt() === 65279) {
								dataStr = dataStr.substr(1, dataStr.length - 1);
							}
							// 检查文件内容是否符合 JSON 规范 
							var jsonData = JSON.parse(dataStr);

							var json = require(path.join(__dirname, './data') + item.data);

							res.write(JSON.stringify(json));
							res.end();

						} catch (err) {
							res.write('错误: 数据 json 内部不是一个有效的JOSN数据!');
							res.end();
						}
					}
				});
			});
		} else if (!item.data && item.cont && item.cont.substr(0, item.cont.lastIndexOf('.')) === urlObj.pathname) {
			isNoPage = true;
			postDataFun(req, function (postData) {
				fs.readFile(path.join(__dirname, './controller') + item.cont, async function (err, data) {
					if (err) {
						res.write('错误: 控制器 js 文件读取失败!');
						res.end();
					} else {
						var strFun = data.toString();
						try {
							/* 对 utf-8 编码的 JSON 文件进行特殊处理 */
							if (strFun.substr(0, 1).charCodeAt() === 65279) {
								strFun = strFun.substr(1, strFun.length - 1);
							}

							// 控制器为空
							if (strFun.length === 0) {
								res.write('错误: 控制器文件为空!');
								res.end();
							} else {
								var conFun = require(path.join(__dirname, './controller') + item.cont);
								if (conFun && typeof conFun === 'function') {
									var result = await conFun(req, res, urlObj.query, postData);
									if (!res.finished) {
										try {
											if (typeof result === 'object') {
												res.write(JSON.stringify(result));
											} else {
												res.write(result);
											}
										} catch (err) {
											res.write(JSON.stringify({
												code: 500,
												msg: err
											}))
										}
										res.end();
									}
								} else {
									res.write('错误: 控制器必须是一个函数!');
									res.end();
								}
							}
						} catch (err) {
							res.write('错误: ' + err.message);
							res.end();
						}
					}
				});
			});
		}
		return;
	})

	/* 未匹配到页面 404 */
	if (!isNoPage) {
		res.write(config.errMsg);
		res.end();
	}
}

/* 接收POST数据流 */
function postDataFun (req, callback) {
	// FORM 表单数据分割线
	var boundary = '';

	try {
		boundary = '--' + req.headers['content-type'].split('; ')[1].split('=')[1];
		/* 设置数据编码 - 文件上传 */
		req.setEncoding('binary');
	} catch (e) {}

	/* 取POST参数 */
	var streamBody = '';

	/* 分段接收 */
	req.on('data', function (str) {
		streamBody += str;
	})

	/* 接收完成 */
	req.on('end', function () {
		var postData;

		/* 容错 */
		try {
			if (isFormData(req.headers)) {
				if (!boundary) {
					/* 普通 FORM 表单 非二进制 */
					var tempBoundaryStr = streamBody.split('\r\n')[streamBody.split('\r\n').length - 2];
					boundary = tempBoundaryStr.substr(0, tempBoundaryStr.length - 2);
				}
				postData = fdToObj(streamBody, boundary);
			} else {
				postData = JSON.parse(streamBody);
			}
		} catch (e) {
			postData = qs.parse(streamBody, {ignoreQueryPrefix: true});
		}
		
		if (callback && typeof callback === 'function') callback(postData);
	})
}

/* 清除 require 缓存 */
function clearRequireCache () {
	for (var key in require.cache) {
		Reflect.deleteProperty(require.cache, require.resolve(key));
	}
}

/* 判断是否为 Form 表单数据 */
function isFormData (headers) {
	return headers['content-type'] === 'application/x-www-form-urlencoded' || headers['content-type'].indexOf('multipart/form-data; boundary=----WebKitFormBoundary') !== -1;
}

/* Form数据转对象 */
function fdToObj (bufStr, boundary) {
	// 定义最终返回结果
    var retObj = {};

    // 将原数据通过分割符分割
    var sliceArr = bufStr.split(boundary);

    // 移除切片数组首尾非数据元素节点
    sliceArr = sliceArr.slice(1, sliceArr.length - 1);

    // 移除切片中字符串的首尾换行
    sliceArr = sliceArr.map(function (str) {
        return str.replace(/^\r\n/, '').replace(/\r\n$/, '');
    })

    // 处理数据
    sliceArr.map(function (str) {

        var sliceIndex = str.indexOf('\r\n\r\n');

        var fieldInfo = str.slice(0, sliceIndex);

        var dataInfo = str.slice(sliceIndex + 4, str.length);

        var field;

        if (fieldInfo.indexOf('\r\n') === -1) {
            // 字段数据
            field = fieldInfo.split('; ')[1].split('=')[1].replace(/^"/, '').replace(/\"$/, '');

            // 填充数据
            retObj[field] = dataInfo;
            
        } else {
            // 文件数据
            var labels = fieldInfo.replace('\r\n', '; ').split('; ');
            var fileInfo = {};
            labels = labels.map(function (label) {
                if (label.indexOf('=') !== -1) {
                    fileInfo[label.split('=')[0]] = label.split(label.split('=')[0] + '=')[1].replace(/^"/, '').replace(/\"$/, '');
                } else {
                    var key = label.split(': ')[0].trim();
                    var val = label.split(': ')[1].trim();
                    fileInfo[key] = val;
                }
            })
            // 添加文件扩展名
            fileInfo.extname = path.extname(fileInfo.filename);
            fileInfo.binary = dataInfo;

            // 填充数据 文件上传可能出现多个字段，每个字段可能上传多个文件
            if (!retObj[fileInfo.name]) {
                retObj[fileInfo.name] = [fileInfo];
            } else {
                retObj[fileInfo.name].push(fileInfo);
            }
        }

    })

    return retObj;
}

/* 将服务器程序输出 */
module.exports = initServer;