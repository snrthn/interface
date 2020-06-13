## 这里是控制器根目录

新建 `*.js` 格式文件模板如下：

```javascript
module.exports = function (req, res, query, data, json) {
	// 参数说明
	// req => 请求头对象
	// res => 响应头对象
	// query => URL参数对象
	// data => 请求体参数对象
	// json => json文件数据
	var resData = JSON.parse(JSON.stirngify(json));

	// 这里可对 resData 做任何处理

	// 返回数据
	res.write(JSON.stringify(resData));
	res.end();
};
```