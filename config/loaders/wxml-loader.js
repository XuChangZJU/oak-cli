/**
 *
 * @param {*} content 文件信息
 */
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
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

// 替换xmldom生成的无值属性
function replaceBooleanAttr(code) {
    let reg;
    BOOLEAN_ATTRS.forEach((v) => {
        reg = new RegExp(`${v}=['"]${v}['"]`, 'ig');
        code = code.replace(reg, v);
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

module.exports = function (content) {
    const options = this.getOptions() || {}; //获取配置参数
    // const callback = this.async();
    const { options: webpackLegacyOptions, _module = {}, resourcePath } = this;
    const { context, target } = webpackLegacyOptions || this;
    // console.log(context, target);

    if (/miniprogram_npm/.test(context)) {
        return content;
    }
    if (
        /node_modules/.test(context) &&
        !/oak-general-business\/wechatMp/.test(context)
    ) {
        return content;
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
    }).parseFromString(content, 'text/xml');
    traverse(doc, (node) => {
        if (node.nodeType === node.ELEMENT_NODE) {
            // 处理oak:value声明的属性
            if (node.hasAttribute('oak:value')) {
                const oakValue = node.getAttribute('oak:value');
                node.removeAttribute('oak:value');
                node.setAttribute('value', `{{${oakValue}}}`);
                node.setAttribute('data-path', oakValue);

                if (node.hasAttribute('oak:forbidFocus')) {
                    node.removeAttribute('oak:forbidFocus');
                } else {
                    node.setAttribute('focus', `{{!!oakFocused.${oakValue}}}`);
                }
            }
        }
    });

    const serialized = new XMLSerializer().serializeToString(doc);
    const code = replaceBooleanAttr(serialized);
    return code;
};
