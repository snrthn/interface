var path = require('path');
var rd = require('rd');

/* 读取目录 */
function readDir (dir) {
	return new Promise(function (resolve, reject) {
		rd.read(path.join(__dirname, dir), function (err, files) {
			if (err) reject(err);
			resolve(files);
		});
	})
}

/* 替换双斜杠 */
function replaceSlash (arr) {
	var newArr = arr.map(function (item) {
		return item.replace(/\\/g, '/');
	})
	return newArr;
}

/*截取有效目录*/
function handleDir (arr) {
	var baseDir = arr[0];
	var temp = arr.splice(1);
	var newArr = temp.map(function (item) {
		return item.split(baseDir)[1];
	});
	return newArr;
}

/* 过虑条件 */
function filterDir (arr, ext) {
	var newArr = arr.filter(function (item) {
		return item.lastIndexOf(ext) !== -1;
	});
	return newArr;
}

/* 输出路由配置 */
module.exports = function (callback) {
	var dataCollection = [];
	var contCollection = [];
	Promise.all([
		readDir('./data'),
		readDir('./controller')
	]).then(function ([arr1, arr2]) {
		// 替换路径双斜杠
		var repArr1 = replaceSlash(arr1);
		var repArr2 = replaceSlash(arr2);

		// 过滤根目录和基础目录
		var remArr1 = handleDir(repArr1);
		var remArr2 = handleDir(repArr2);

		// 筛选指定格式的路径
		var resArr1 = filterDir(remArr1, '.json');
		var resArr2 = filterDir(remArr2, '.js');
		
		// 执行回调函数
		callback({
			dataCollection: resArr1,
			contCollection: resArr2
		});
	}).catch(function (err) {
		console.log(err);
	});
}