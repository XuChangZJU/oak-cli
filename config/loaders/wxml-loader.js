/**
 *
 * @param {*} content 文件信息
 */
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const { resolve } = require('path');
const { isUrlRequest, urlToRequest } = require('loader-utils');

const BOOLEAN_ATTRS = [
    'wx:else',
    'show-info',
    'active',
    'controls',
    'danmu-btn',
    'enable-danmu',
    'autoplay',
    'disabled',
    'show-value',
    'checked',
    'scroll-x',
    'scroll-y',
    'auto-focus',
    'focus',
    'auto-height',
    'password',
    'indicator-dots',
    'report-submit',
    'hidden',
    'plain',
    'loading',
    'redirect',
    'loop',
    'controls',
];

const OPERATORS = {
    '&lt;': '<',
    '&lte;': '<=',
    '&gt;': '>',
    '&gte;': '>=',
    '&amp;': '&',
    '&quot;': "'",
};

// 替换xmldom生成的无值属性
function replaceBooleanAttr(code) {
    let reg;
    BOOLEAN_ATTRS.forEach((v) => {
        reg = new RegExp(`${v}=['"]${v}['"]`, 'ig');
        code = code.replace(reg, v);
    });
    return code;
}

// 替换xmldom生成的运算符转义
function replaceOperatorAttr(code) {
    let reg;
    Object.keys(OPERATORS).forEach((v) => {
        reg = new RegExp(`${v}`, 'ig');
        code = code.replace(reg, OPERATORS[v]);
    });
    return code;
}

function traverse(doc, callback) {
    callback(doc);
    if (doc.childNodes) {
        const { length } = doc.childNodes;
        for (let i = 0; i < length; i++) {
            traverse(doc.childNodes.item(i), callback);
        }
    }
}

const isSrc = (name) => name === 'src';

const isDynamicSrc = (src) => /\{\{/.test(src);

module.exports = async function (content) {
    // loader的缓存功能
    // this.cacheable && this.cacheable();

    const options = this.getOptions() || {}; //获取配置参数
    const callback = this.async();
    const { options: webpackLegacyOptions, _module = {}, _compilation = {}, resourcePath } = this;
    const { context, target } = webpackLegacyOptions || this;
    // console.log(context, target);
    const issuer = _compilation.moduleGraph.getIssuer(this._module);
    const issuerContext = (issuer && issuer.context) || context;
    const root = resolve(context, issuerContext);
    let source = content;
    if (/pages/.test(context)) {
        source =
            source +
            '<message show="{{!!oakError}}" type="{{oakError.type}}" content="{{oakError.msg}}" />';
    }

    // console.log(content, options);
    /**
     * domparser会自动给没有value的attribute赋上值，目前改不动
     */
    const doc = new DOMParser({
        errorHandler: {
            warning(x) {
                if (
                    x.indexOf('missed value!!') === -1 &&
                    x.indexOf('missed quot(")!') === -1
                ) {
                    console.log(x);
                }
            },
        },
    }).parseFromString(source, 'text/xml');
    const requests = [];
    traverse(doc, (node) => {
        if (node.nodeType === node.ELEMENT_NODE) {
            // xml存在src path路径
            if (node.hasAttribute('src')) {
                const value = node.getAttribute('src');
                if (
                    value &&
                    !isDynamicSrc(value) &&
                    isUrlRequest(value, root)
                ) {
                    const path = resolve(root, value)
                    // const request = urlToRequest(value, root);
                    requests.push(path);
                }
            }
            // 处理oak:value声明的属性
            if (node.hasAttribute('oak:value')) {
                const oakValue = node.getAttribute('oak:value');
                node.removeAttribute('oak:value');
                node.setAttribute('value', `{{${oakValue}}}`);
                node.setAttribute('data-attr', oakValue);
                node.setAttribute('oakPath', oakValue);
                node.setAttribute('oakValue', `{{${oakValue}}}`);
                node.setAttribute('oakParent', `{{oakFullpath}}`);
                if (node.hasAttribute('oak:forbidFocus')) {
                    node.removeAttribute('oak:forbidFocus');
                } else {
                    node.setAttribute('focus', `{{!!oakFocused.${oakValue}}}`);
                }
            }
        }
    });

    const loadModule = (request) =>
        new Promise((resolve, reject) => {
            this.addDependency(request);
            this.loadModule(request, (err, src) => {
                /* istanbul ignore if */
                if (err) {
                    reject(err);
                } else {
                    resolve(src);
                }
            });
        });

    try {
        for (const req of requests) {
            const module = await loadModule(req);
        }
        let code = new XMLSerializer().serializeToString(doc);
        code = replaceBooleanAttr(code);
        code = replaceOperatorAttr(code);
        callback(null, code);
    } catch (err) {
        callback(err, content);
    }
};
