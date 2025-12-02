// 写入文件到磁盘
var fs = require('fs');
var path = require('path');

module.exports = async function (options) {

    // 完成文件信息
    var fileInfo = null;

    return await new Promise(function (resolve, reject) {
        var pathList = [];
        var recData = options.data || {};

        if (Object.prototype.toString.call(recData.filepath) === '[object Array]') {
            pathList = recData.filepath;
        } else {
            pathList = recData.filepath.split(',');
        }

        try {				
            for (var i = 0; i < pathList.length; i++) {
                fs.unlinkSync(global.uploadDir + '/' + pathList[i]);
            }

            fileInfo = {
                state: 200,
                success: true,
                message: '文件删除成功'
            };

        } catch (e) {

            fileInfo = {
                state: 500,
                success: false,
                message: i === 0 ? '文件删除发生错误' : ('已删除' + i + '个文件，' + '删除第' + ( i + 1) + '个文件时发生错误')
            };

        }

        if (options.success && Object.prototype.toString.call(options.success) === '[object Function]') {
            options.success(fileInfo)
        }

        resolve(fileInfo)

    }).then(function (fileInfo) {
        return fileInfo;
    })
}