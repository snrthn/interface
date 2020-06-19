var http = require('http');
var path = require('path');
var urlParser = require('url');
var controller = require('./router');
var config = require('../config');
var fs = require('fs');
var qs = require('qs');

/* 定义控制器路由表 */
var routerList = [];

/* 创建服务器 */
function initServer () {
	var server = http.createServer(function (req, res) {
		/* 刷新路由表 */
		routerList = [];

		fillRouterTable(function () {
			/* 设置请求头和跨域 */
			res.writeHead(200, {
				'Content-Type': 'application/json;charset=UTF-8',
				'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,HEAD',
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Allow-Origin': '*'
			});

			/* 取URL参数 */
			var urlObj = urlParser.parse(req.url, true);

			/* 判断是否匹配到 */
			var isNoPage = false;

			/* 处理首页 */
			if (urlObj.pathname === '/') {
				isNoPage = true;
				res.write(config.indexMsg);
				res.end();
			}

			/* 匹配路由控制表 */
			routerList.map(function (item) {
				if (item.data && item.data.substr(0, item.data.lastIndexOf('.')) === urlObj.pathname) {
					isNoPage = true;
					postDataFun(req, function (postData) {
						/* 输出 */
						var jsonData;
						if (!item.cont) {
							fs.readFile(path.join(__dirname, './data') + item.data, function (err, data) {
								if (err) {
									res.write('错误: 数据 json 文件读取失败!');
								} else {
									var dataStr = data.toString();
									try {
										/* 对 utf-8 编码的 JSON 文件进行特殊处理 */
										if (dataStr.substr(0, 1).charCodeAt() === 65279) {
											dataStr = dataStr.substr(1, dataStr.length - 1);
										}
										/* 检查文件内容是否符合 JSON 规范 */
										var json = JSON.parse(dataStr);

										res.write(JSON.stringify(json));
									} catch (err) {
										res.write('错误: 数据 json 内部不是一个有效的JOSN数据!');
									}
								}
								res.end();
							})
						} else {
							jsonData = require(path.join(__dirname, './data') + item.data);
							fs.readFile(path.join(__dirname, './controller') + item.cont, function (err, data) {
								if (err) {
									res.write('错误: 控制器 js 文件读取失败!');
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
										} else if (strFun.indexOf('.write(') === -1 && strFun.indexOf('.end(') === -1) {
											res.write('错误: 控制器函数体内缺少回执语句!');
										} else {
											Reflect.deleteProperty(require.cache, require.resolve(path.join(__dirname, './controller') + item.cont));
											var conFun = require(path.join(__dirname, './controller') + item.cont);
											if (conFun && typeof conFun === 'function') {
												conFun(req, res, urlObj.query, postData, jsonData);
											} else {
												res.write('错误: 控制器必须是一个函数!');
											}
										}

									} catch (err) {
										res.write('错误: ' + err.message);
									}
								}
								res.end();
							})
						}
					});
				}
				if (!item.data && item.cont && item.cont.substr(0, item.cont.lastIndexOf('.')) === urlObj.pathname) {
					isNoPage = true;
					postDataFun(req, function (postData) {
						fs.readFile(path.join(__dirname, './controller') + item.cont, function (err, data) {
							if (err) {
								res.write('错误: 控制器 js 文件读取失败!');
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
									} else if (strFun.indexOf('.write(') === -1 && strFun.indexOf('.end(') === -1) {
										res.write('错误: 控制器函数体内缺少回执语句!');
									} else {
										Reflect.deleteProperty(require.cache, require.resolve(path.join(__dirname, './controller') + item.cont));
										var conFun = require(path.join(__dirname, './controller') + item.cont);
										if (conFun && typeof conFun === 'function') {
											conFun(req, res, urlObj.query, postData, null);
										} else {
											res.write('错误: 控制器必须是一个函数!');
										}
									}

								} catch (err) {
									res.write('错误: ' + err.message);
								}
							}
							res.end();
						})
					})
				}
			})

			/* 未匹配到页面 404 */
			if (!isNoPage) {
				res.write(config.errMsg);
				res.end();
			}
		});
	})

	/* 监听端口 */
	server.listen(config.port, function () {
		console.log(config.port + '端口监听中...');
	})
}

/* 填装控制器路由表 */
function fillRouterTable (callback) {
	controller(function (filesObj) {
		var { dataCollection, contCollection } = filesObj;

		var dataLen = dataCollection.length;
		var contLen = contCollection.length;

		var temp = [];
		var datExt = '';
		var conExt = '';

		for (var i = 0; i < dataLen; i++) {
			var data = dataCollection[i];
			if (!datExt) datExt = data.split(data.lastIndexOf('.'), data.length - 1);
			var resDat = data.substr(0, data.lastIndexOf('.'));
			temp.push(resDat);
		}

		for (var i = 0; i < contLen; i++) {
			var cont = contCollection[i];
			if (!conExt) conExt = cont.split(cont.lastIndexOf('.'), cont.length - 1);
			var resCon = cont.substr(0, cont.lastIndexOf('.'));
			if (temp.indexOf(resCon) !== -1) {				
				routerList.push({
					data: resCon + datExt,
					cont
				});
				temp.splice(temp.indexOf(resCon), 1);
			} else {
				routerList.push({
					data: null,
					cont
				});
			}
		}

		var tempLen = temp.length;

		for (var i = 0; i < tempLen; i++) {
			routerList.push({
				data: temp[i] + conExt,
				cont: null
			})
		}

		console.log(routerList);

		if (callback && typeof callback === 'function') callback();
	})
}

/* 接收POST数据流 */
function postDataFun (req, callback) {
	/* 取POST参数 */
	var tempStream = [];

	/* 分段接收 */
	req.on('data', function (str) {
		tempStream.push(str);
	})

	/* 接收完成 */
	req.on('end', function () {
		var postData;
		var postStr = tempStream.toString();

		/* 容错 */
		try {
			if (postStr.indexOf('WebKitFormBoundary') !== -1) {
				postData = fdToObj(postStr);
			} else {
				postData = JSON.parse(postStr);
			}
		} catch (e) {
			postData = qs.parse(postStr, {ignoreQueryPrefix: true});
		}

		if (callback && typeof callback === 'function') callback(postData);
	})
}

/* formData 数据转 Object */
function fdToObj (str) {
	var arr = str.match(/\w+?="\w+"\r\n\r\n[^\n]+/g) || [];
	var resObj = {};
	arr.map(function (item) {
		var temp = item.split('\r\n\r\n');
		resObj[temp[0].split('=')[1]] = temp[1];
	})
	return resObj;
}

/* 将服务器程序输出 */
module.exports = initServer;