// 写入文件到磁盘
var fs = require('fs');

module.exports = function (options) {

    // 文件列表数组
    var bufStreamList = [];

    // 完成文件信息
    var fileInfo = {};

    // 建立文件存放目录
    var date = new Date();
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(0, 2);
    var downLoadPath = '/' + year + month + '/';
    var writeFileDir = (options.uploadDir || global.uploadDir) + '\\' + year + month + '\\';

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
                        fileInfo[fileKey].push((options.baseUrl || '') + downLoadPath + fileName + fileObj.extname)
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
                options.success(fileInfo);
            }
        }
    })
}