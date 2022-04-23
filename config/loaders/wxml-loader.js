const loaderUtils = require('loader-utils');

/**
 *
 * @param {*} content 文件信息
 * @param {*} map 文件映射信息
 * @param {*} meta 模块的元数据
 */
module.exports = function (content, map, meta) {
    // const options = loaderUtils.getOptions(this);
    // console.log(content, options);
    return content;
};
