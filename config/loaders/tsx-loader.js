const { resolve, relative } = require('path');

module.exports = function (content) {
    /* const options = this.getOptions() || {}; //获取配置参数
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
        // console.log(content);

    } */

    return content;
};
