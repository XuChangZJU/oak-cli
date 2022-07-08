
const postcss = require('postcss');
const Rpx2px = require('./rpx2px');

module.exports = postcss.plugin('postcss-rpx2px', function (options) {
    return function (css, result) {
        const oldCssText = css.toString();
        const rpx2pxIns = new Rpx2px(options);
        const newCssText = rpx2pxIns.generatePx(oldCssText);
        const newCssObj = postcss.parse(newCssText);
        result.root = newCssObj;
    };
});