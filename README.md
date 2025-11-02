# Interface - 轻量级 Node.js 接口服务器

一个基于文件系统的轻量级 API 服务器框架，适用于快速搭建接口服务、提供临时数据补充和原型开发。

## ✨ 特性

- 🚀 **快速开发**：通过文件结构自动生成 API 路由，无需复杂配置
- 📁 **多种数据源**：支持 JSON 文件、数据库（MySQL）、文件上传
- 🔍 **强大的查询**：支持模糊查询、范围查询、分页、排序等功能
- 🗑️ **逻辑删除**：支持软删除，数据可恢复
- 📤 **文件上传**：内置文件上传处理
- 🔒 **安全防护**：SQL 注入防护、参数化查询
- 🌐 **跨域支持**：默认支持跨域请求
- 💾 **连接池管理**：智能的数据库连接池管理
- 😀 **Emoji 支持**：完整的 Unicode 字符支持（utf8mb4）

## 📋 目录结构

```
interface/
├── config/              # 配置文件
│   ├── database.js      # 数据库配置
│   ├── headers.js       # 请求头配置
│   ├── index.js         # 主配置文件
│   ├── mime.json         # MIME 类型配置
│   └── httpcode.json    # HTTP 状态码配置
├── src/
│   ├── controller/      # 控制器目录（业务逻辑）
│   ├── data/            # JSON 数据文件目录
│   ├── sql/              # 数据库操作模块
│   │   ├── add.js        # 新增数据
│   │   ├── connect.js    # 数据库连接
│   │   ├── query.js      # 查询数据
│   │   ├── remove.js     # 删除数据
│   │   └── update.js      # 更新数据
│   ├── static/           # 静态资源目录
│   ├── utils/            # 工具函数
│   ├── index.js          # 服务器入口
│   ├── router.js         # 路由处理
│   └── writeFile.js      # 文件上传处理
├── server.js            # 启动文件
└── package.json         # 项目依赖
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置数据库

编辑 `config/database.js`：

```javascript
let dataconf = {
    dataHost: '127.0.0.1',
    dataPort: 3306,
    user: 'root',
    password: 'your_password',
    database: 'your_database',
    charset: 'utf8mb4'  // 支持 emoji
}
```

### 启动服务器

```bash
node server.js
```

默认端口：`8004`（可在 `config/index.js` 中修改）

## 📖 使用指南

### 1. JSON 数据接口

#### 创建 JSON 数据文件

在 `src/data/` 目录下创建 JSON 文件，文件名自动映射为 API 路径：

**示例 1：简单接口**
```
src/data/userinfo.json
→ API: http://127.0.0.1:8004/userinfo
```

**示例 2：目录结构**
```
src/data/book/price.json
→ API: http://127.0.0.1:8004/book/price
```

**JSON 文件格式：**

```json
// 数组格式
[
    { "id": 1, "name": "张三" },
    { "id": 2, "name": "李四" }
]

// 或对象格式
{
    "code": 200,
    "data": [...]
}
```

**注意**：JSON 文件必须至少包含一个对象或数组，不能为空。

#### 创建控制器（可选）

如果需要处理业务逻辑，在 `src/controller/` 目录下创建对应的 JS 文件：

```javascript
// src/controller/userinfo.js
module.exports = function (req, res, query, data, json) {
    // req => 请求对象
    // res => 响应对象
    // query => URL 查询参数
    // data => POST 请求体数据
    // json => JSON 文件数据
    
    // 处理数据
    var result = json.map(item => {
        // 数据处理逻辑
        return item;
    });
    
    // 返回数据
    return result;
};
```

### 2. 数据库接口

#### 配置数据库表

确保数据库表已创建，支持逻辑删除的表需要包含以下字段：

```sql
-- 添加逻辑删除字段
ALTER TABLE your_table 
ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 COMMENT '删除标记',
ADD COLUMN deleted_at DATETIME NULL COMMENT '删除时间';
```

#### 创建数据库控制器

```javascript
// src/controller/your_api.js
module.exports = function (req, res, query, data) {
    let options = {
        dataname: 'your_database',  // 数据库名
        tablename: 'your_table',    // 表名
        query: query,               // URL 参数
        data: data                  // POST 数据
    };
    
    switch (req.method) {
        case 'GET':
            getData(options, res);
            break;
        case 'POST':
            addData(options, res);
            break;
        case 'PUT':
            updateData(options, res);
            break;
        case 'DELETE':
            removeData(options, res);
            break;
    }
}

function getData(options, res) {
    // 自动过滤已删除数据
    database.query({ ...options, include_deleted: false }, function (err, data) {
        if (!err) {
            res.write(JSON.stringify({
                status: 200,
                success: true,
                message: '查询成功',
                data: data
            }));
        }
        res.end();
    });
}
```

## 🔍 查询功能

### 基础查询

```javascript
// 精确匹配
GET /api/users?name=张三&age=25
// SQL: WHERE name = ? AND age = ?

// 模糊查询
GET /api/users?name_like=张
// SQL: WHERE name LIKE '%张%'

// 数值比较
GET /api/users?age_gt=18&age_lte=65
// SQL: WHERE age > 18 AND age <= 65
```

### 查询操作符

| 操作符 | 说明 | 示例 | SQL |
|--------|------|------|-----|
| 无后缀 | 精确匹配 | `age=18` | `WHERE age = ?` |
| `_like` | 模糊查询 | `name_like=张` | `WHERE name LIKE '%张%'` |
| `_gt` | 大于 | `age_gt=18` | `WHERE age > ?` |
| `_lt` | 小于 | `age_lt=65` | `WHERE age < ?` |
| `_gte` | 大于等于 | `age_gte=18` | `WHERE age >= ?` |
| `_lte` | 小于等于 | `age_lte=65` | `WHERE age <= ?` |
| `_in` | 包含 | `status_in=active,pending` | `WHERE status IN (?,?)` |
| `_not_in` | 不包含 | `id_not_in=1,2,3` | `WHERE id NOT IN (?,?,?)` |

### 排序和分页

```javascript
// 排序
GET /api/users?orderBy=created_at&orderDirection=DESC

// 分页
GET /api/users?pageNumber=2&pageSize=10
// SQL: LIMIT 10 OFFSET 10
```

**分页参数：**
- `pageNumber`: 页码（从 1 开始）
- `pageSize`: 每页数量

### 完整查询示例

```javascript
// 复杂查询示例
GET /api/users?name_like=张&age_gte=18&status_in=active,pending&orderBy=created_at&orderDirection=DESC&pageNumber=2&pageSize=10

// 生成 SQL:
// SELECT * FROM users 
// WHERE name LIKE '%张%' 
//   AND age >= 18 
//   AND status IN ('active','pending')
// ORDER BY created_at DESC
// LIMIT 10 OFFSET 10
```

## 🗑️ 逻辑删除

### 功能说明

逻辑删除通过标记数据为"已删除"状态，而不是真正从数据库中移除数据。

### 使用方式

**查询时自动过滤已删除数据：**

```javascript
// 控制器中设置
database.query({ 
    ...options, 
    include_deleted: false  // 默认过滤已删除数据
}, callback);
```

**删除时使用逻辑删除：**

```javascript
// 控制器中设置
database.remove({ 
    ...options, 
    logical_delete: true  // 使用逻辑删除
}, callback);
```

### 数据库字段

逻辑删除需要表包含以下字段：

```sql
is_deleted TINYINT(1) DEFAULT 0  -- 0=未删除, 1=已删除
deleted_at DATETIME NULL         -- 删除时间
```

## 📤 文件上传

### 上传文件控制器示例

```javascript
// src/controller/upload.js
module.exports = function (req, res, query, data) {
    // 检测文件
    if (!data.file) {
        return {
            status: 400,
            success: false,
            message: '选择文件为空!'
        };
    }
    
    // 写入文件
    global.writeFile({ data }).then(fileInfo => {
        return {
            status: 200,
            success: true,
            data: fileInfo,
            message: '文件上传成功!'
        };
    });
};
```

### 配置上传目录

编辑 `config/index.js`：

```javascript
let config = {
    uploadDir: '../upload',  // 上传文件目录
    fileOrigin: 'https://www.xxx.com/files'  // 文件访问域名
};
```

## ⚙️ 配置说明

### 服务器配置

编辑 `config/index.js`：

```javascript
let config = {
    port: 8004,                    // 服务器端口
    indexMsg: 'Hello World!',      // 首页消息
    uploadDir: '../upload',        // 上传目录
    staticDir: './src/static',     // 静态资源目录
    fileOrigin: 'https://xxx.com', // 文件访问域名
    isCache: false                 // 是否启用缓存
};
```

### 数据库配置

编辑 `config/database.js`：

```javascript
let dataconf = {
    dataHost: '127.0.0.1',
    dataPort: 3306,
    user: 'root',
    password: 'your_password',
    database: 'your_database',
    charset: 'utf8mb4'  // 支持 emoji 和特殊字符
};
```

### 跨域配置

编辑 `config/headers.js`：

```javascript
let headerConfig = {
    'common': {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,HEAD',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*'
    }
};
```

## 🔒 安全特性

1. **SQL 注入防护**：使用参数化查询（Prepared Statements）
2. **逻辑删除过滤**：默认过滤已删除数据，避免意外暴露
3. **参数验证**：自动过滤空值和无效参数
4. **连接池管理**：智能管理数据库连接，防止连接泄漏

## 📝 注意事项

1. **JSON 文件格式**：必须至少包含一个对象或数组
2. **数据库字符集**：建议使用 `utf8mb4` 支持 emoji 和特殊字符
3. **逻辑删除字段**：需要添加 `is_deleted` 和 `deleted_at` 字段
4. **连接池**：使用连接池时不要手动调用 `db.end()`
5. **缓存机制**：开发时建议关闭缓存（`isCache: false`）

## 🛠️ 常用 SQL 脚本

### 添加逻辑删除字段

```sql
-- 为表添加逻辑删除字段
ALTER TABLE your_table 
ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 COMMENT '删除标记',
ADD COLUMN deleted_at DATETIME NULL COMMENT '删除时间',
ADD INDEX idx_is_deleted (is_deleted);
```

### 修改字符集支持 Emoji

```sql
-- 修改数据库字符集
ALTER DATABASE your_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修改表字符集
ALTER TABLE your_table CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📚 示例项目

项目包含以下示例控制器：
- `src/controller/database.js` - 数据库操作示例
- `src/controller/upload.js` - 文件上传示例
- `src/controller/simple_pagination_example.js` - 分页查询示例

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

ISC License

## 🔗 相关链接

- GitHub: https://github.com/snrthn/interface
- Issues: https://github.com/snrthn/interface/issues