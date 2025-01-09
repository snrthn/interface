// 写入文件到磁盘
var fs = require('fs');
var path = require('path');

module.exports = async function (options) {

    // 文件列表数组
    var bufStreamList = [];

    // 完成文件信息
    var fileInfo = {};

    // 建立文件存放目录
    var date = new Date();
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, 0);
    var downLoadPath = '/' + year + month + '/';
    var writeFileDir = (options.uploadDir || global.uploadDir) + path.sep + year + month + path.sep;

    return await new Promise(function (resolve, reject) {
        fs.mkdir(writeFileDir, {recursive: true}, (err) => {
            if (!err) {
                for (var key in options.data) {

                    var item = options.data[key];
                    if (Object.prototype.toString.call(item) === '[object Array]') {
                        var arrFiles = item;
                        var fileKey = arrFiles[0].name;
                        fileInfo[fileKey] = [];

                        for (var i = 0; i < arrFiles.length; i++) {
                            var fileObj = arrFiles[i];
                            var fileName = new Date() * 1 + '_' + parseInt(Math.random() * 1000000);
                            fileInfo[fileKey].push((options.fileOrigin || global.fileOrigin) + downLoadPath + fileName + fileObj.extname)
                            bufStreamList.push({
                                binary: fileObj.binary,
                                filename: fileName + fileObj.extname
                            });
                        }
                    }
                }

                for (var i = 0; i < bufStreamList.length; i++) {
                    fs.writeFileSync(writeFileDir + bufStreamList[i].filename, Buffer.from(bufStreamList[i].binary.toString('binary'), 'binary'));
                }

                if (options.success && Object.prototype.toString.call(options.success) === '[object Function]') {
                    options.success(fileInfo)
                }

                resolve(fileInfo)
            }
        })
    }).then(function (fileInfo) {
        return fileInfo;
    })
}