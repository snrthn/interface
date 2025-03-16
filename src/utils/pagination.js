// 数据分页 默认为每1页，10条数据

module.exports = function (list, options = { pageNumber: 1, pageSize: 10 }) {
    let { pageNumber, pageSize } = options;
    let start = (pageNumber - 1) * pageSize;
    let end = pageNumber * pageSize;
    return list.slice(start, end);
}