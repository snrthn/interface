
## 该目录下可创建与data数据目录同名的js格式文件

## 该操作为可选，不创建的话JSON数据将直接返回

## 例如：./aaa/bbb.js 文件

## 文件内容书写如下：

module.exports = function (req, res, query, data, json) {

	// => req 请求对象
	// => res 返回对象
	// => query URL传参对象
	// => data post 请求体
	// => json 取到的JSON文件数据

	res.write(JSON.stringify(json));
	res.end();
};

## 该函数会被自动读取，可以自行对传来的参数进行判断，有针对性的返回数据。