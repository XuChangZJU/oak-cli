const { resolve, relative } = require('path');
const rpxRegExp = /\b(\d+(\.\d+)?)rpx\b/;

const defaultOptions = {
    baseDpr: 2, // base device pixel ratio (default: 2)
    rpxUnit: 750, // rpx unit value (default: 750)
    rpxPrecision: 6, // rpx value precision (default: 6)
    forceRpxComment: 'rpx', // force px comment (default: `rpx`)
    keepComment: 'no', // no transform value comment (default: `no`)
};

module.exports = function (source) {
    const options = Object.assign(defaultOptions, this.getOptions()); //获取配置参数
    /* 
    const { context: projectContext } = options; // context 本项目路径
    const {
        options: webpackLegacyOptions,
        _module = {},
        _compilation = {},
        resourcePath,
    } = this;

    const { context, target } = webpackLegacyOptions || this;
    const issuer = _compilation.moduleGraph.getIssuer(this._module);
    const issuerContext = (issuer && issuer.context) || context;
    const root = resolve(context, issuerContext);
    if (/.tsx|.jsx/.test(resourcePath)) {
        // console.log(source);

    } */
    // const { rpxUnit } = options;

    // function getValue(val) {
    //     return val == 0 ? val : `calc(100vw / ${rpxUnit} * ${val})`;
    // }

    // const rpxGlobalRegExp = new RegExp(rpxRegExp.source, 'g');
    // if (rpxGlobalRegExp.test(source)) {
    //     return source.replace(rpxGlobalRegExp, function ($0, $1) {
    //         return getValue($1);
    //     });
    // }

    return source;
};

