var path = require('path');
var rd = require('rd');

function readDir (dir) {
	return new Promise(function (resolve, reject) {
		rd.read(path.join(__dirname, dir), function (err, files) {
			if (err) reject(err);
			resolve(files);
		});
	})
}

module.exports = function (callback) {
	var dataCollection = [];
	var contCollection = [];
	Promise.all([
		readDir('./data'),
		readDir('./controller')
	]).then(function ([arr1, arr2]) {
		callback({
			dataCollection: arr1,
			contCollection: arr2
		});
	}).catch(function (err) {
		console.log(err);
	});
}