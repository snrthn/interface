# interface

#### 这是一个公共接口程序，适用于临时提供项目数据补充。

#### 以下将对该程序的使用方法做简单的介绍：

---

### 1. 配置信息在 config/index.js 文件中可自己修改。

---

### 2. 数据层文件定义在 src/data/ 目录下, 以 json 数据文件单独定义, 也可在此基础上建立目录结构。

#### 接口示例1: src/data/userinfo.json, 这是一个用户信息的接口, 请求路径是: http://127.0.0.1:8000/userinfo

#### 接口示例2: src/data/book/price.json, 这是一个书籍价格接口,  请求路径是: http://127.0.0.1:8000/book/price

#### userinfo.json 文件必须至少写一个对象或者数组，否则会报错。

#### 数组示例：

```json
[]
```
#### 对象示例：

```json
{}
```
---

### 3. 控制层路径定义在 src/controller/ 目录下, 以 js 

#### 文件形式存在，文件名和数据名是对应的, 作用是判断请求参数或者对返回数据进行二次处理。

#### 数据控制功能为可选, 不建立对应的 js 控制器, 数据接口则直接返回。

#### 控制器示例1: src/controller/userinfo.js

#### userinfo.js 文件模板如下:

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