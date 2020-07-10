var http = require('http');
var path = require('path');
var urlParser = require('url');
var controller = require('./router');
var config = require('../config');
var fs = require('fs');
var qs = require('qs');

/* 创建服务器 */
function initServer () {
	var server = http.createServer(function (req, res) {

		/* 设置请求头和跨域 */
		res.writeHead(200, {
			'Content-Type': 'application/json;charset=UTF-8',
			'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,HEAD',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Origin': '*'
		});
		
		/* 初始化数据库 */
		global.database = (function () {
			Reflect.deleteProperty(require.cache, require.resolve(path.join(__dirname, './sql')));
			return require('./sql');
		}());

		/* 处理复杂类型请求 */
		if (req.method === 'OPTIONS') {
			res.write('ALLOW');
			res.end();
		}

		/* 刷新路由表 */
		var routerList = [];

		fillRouterTable(function () {

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
									} else if (strFun.indexOf('.write(') === -1 && strFun.indexOf('.end(') === -1) {
										res.write('错误: 控制器函数体内缺少回执语句!');
										res.end();
									} else {
										Reflect.deleteProperty(require.cache, require.resolve(path.join(__dirname, './controller') + item.cont));
										var conFun = require(path.join(__dirname, './controller') + item.cont);
										if (conFun && typeof conFun === 'function') {

											// 取 JSON 数据
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
														/* 检查文件内容是否符合 JSON 规范 */
														var jsonData = JSON.parse(dataStr);

														conFun(req, res, urlObj.query, postData, jsonData);
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
									/* 检查文件内容是否符合 JSON 规范 */
									var json = JSON.parse(dataStr);

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
									} else if (strFun.indexOf('.write(') === -1 && strFun.indexOf('.end(') === -1) {
										res.write('错误: 控制器函数体内缺少回执语句!');
										res.end();
									} else {
										Reflect.deleteProperty(require.cache, require.resolve(path.join(__dirname, './controller') + item.cont));
										var conFun = require(path.join(__dirname, './controller') + item.cont);
										if (conFun && typeof conFun === 'function') {
											conFun(req, res, urlObj.query, postData);
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
			})

			/* 未匹配到页面 404 */
			if (!isNoPage) {
				res.write(config.errMsg);
				res.end();
			}
		}, routerList);
	})

	/* 监听端口 */
	server.listen(config.port, function () {
		console.log(config.port + '端口监听中...');
	})
}

/* 填装控制器路由表 */
function fillRouterTable (callback, routerList) {
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
				data: temp[i] + datExt,
				cont: null
			})
		}

		if (callback && typeof callback === 'function') callback(routerList);
	}, routerList)
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
			if (postStr.indexOf('Content-Disposition: form-data;') !== -1) {
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
	var resObj = {};
	var tempArr = str.match(/\"[^\"]+\"\r\n\r\n[^\n]+/g);
	tempArr.map(function (item) {
		resObj[item.split(/\s+/)[0].replace(/^\"|\"$/g, '')] = item.split(/\s+/)[1];
	})
	return resObj;
}

/* 将服务器程序输出 */
module.exports = initServer;