
const postcss = require('postcss');
const Rpx2px = require('./rpx2px');

// module.exports = postcss.plugin('postcss-rpx2px', function (options) {
//     return function (css, result) {
//         const oldCssText = css.toString();
//         const rpx2pxIns = new Rpx2px(options);
//         const newCssText = rpx2pxIns.generatePx(oldCssText);
//         const newCssObj = postcss.parse(newCssText);
//         result.root = newCssObj;
//     };
// });

module.exports = function (options) {
    return {
        postcssPlugin: 'postcss-rpx2px',
        Once: function (css, { result, AtRule }) {
            const oldCssText = css.toString();
            const rpx2pxIns = new Rpx2px(options);
            const newCssText = rpx2pxIns.generatePx(oldCssText);
            const newCssObj = postcss.parse(newCssText);
            result.root = newCssObj;
        },
        // Declaration(decl) {
        //     console.log(decl.toString());
        // },
    };
};

module.exports.postcss = true;