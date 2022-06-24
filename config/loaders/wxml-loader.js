/**
 *
 * @param {*} content 文件信息
 */
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const { resolve, relative } = require('path');
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
const WeChatMpDir = 'wechatMp'; //规定文件夹名
const TranslationFunction = 't';
const I18nModuleName = 'i18n';
const CURRENT_LOCALE_KEY = '$_locale';
const LOCALE_CHANGE_HANDLER_NAME = '$_localeChange';
const COMMON_LOCALE_DATA = '$_common_translations';
const CURRENT_LOCALE_DATA = '$_translations';
const WXS_PATH = 'i18n/locales.wxs';

function existsT(str) {
    if (!str) return false;
    return (
        str.indexOf('t(') !== -1 &&
        !/^[A-Za-z0-9]*$/.test(
            str.substring(str.indexOf('t(') - 1, str.indexOf('t('))
        )
    );
}

function replaceT(str) {
    return str.replace(/t\(/g, 'i18n.t(');
}

module.exports = async function (content) {
    // loader的缓存功能
    // this.cacheable && this.cacheable();

    const options = this.getOptions() || {}; //获取配置参数
    const { context: projectContext } = options; // context 本项目路径
    const callback = this.async();
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
    let source = content;
    let relativePath; // locales.wxs相对路径
    //判断是否存在i18n的t函数
    if (existsT(source)) {
        //判断加载的xml是否为本项目自身的文件
        const isSelf = context.indexOf(projectContext) !== -1;
        if (isSelf) {
            //本项目xml
            relativePath = relative(
                context,
                projectContext + '/' + WXS_PATH
            ).replace(/\\/g, '/');
        } else {
            //第三方项目的xml
            const index = context.lastIndexOf(WeChatMpDir);
            if (index !== -1) {
                const p = context.substring(index + WeChatMpDir.length);
                relativePath = relative(
                    projectContext + p,
                    projectContext + '/' + WXS_PATH
                ).replace(/\\/g, '/');
            }
        }

        source =
            `<wxs src='${relativePath}' module='${I18nModuleName}'></wxs>` +
            source;
    }
    // 注入全局message组件
    if (/pages/.test(context)) {
        source =
            source +
            `<message show="{{!!oakError}}" type="{{oakError.type || ''}}" content="{{oakError.msg || ''}}" />`;
    }

    const doc = new DOMParser({
        errorHandler: {
            warning(x) {
                if (
                    x.indexOf('missed value!!') === -1 &&
                    x.indexOf('missed quot(")!') === -1 &&
                    x.indexOf('unclosed xml attribute') == -1
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
                    if (relativePath === value) {
                        // 如果出现直接读取项目下i18n/locales.wxs
                        const path = projectContext + '/' + WXS_PATH;
                        requests.push(path);
                    } else {
                        const path = resolve(root, value);
                        // const request = urlToRequest(value, root);
                        requests.push(path);
                    }
                }
            }
            if (node.hasAttribute('oak:value')) {
                // oak:value声明的属性加上value、focus和data-attr
                const oakValue = node.getAttribute('oak:value');
                node.removeAttribute('oak:value');
                node.setAttribute(
                    'value',
                    `{{${oakValue} !== undefined && ${oakValue} !== null ? ${oakValue} : ''}}`
                );
                node.setAttribute('data-attr', oakValue);
                if (node.hasAttribute('oak:forbidFocus')) {
                    node.removeAttribute('oak:forbidFocus');
                } else {
                    node.setAttribute('focus', `{{!!oakFocused.${oakValue}}}`);
                }
            }
            else if (node.hasAttribute('oak:path')) {
                // oak:path声明的属性加上oakPath和oakParent
                const oakValue = node.getAttribute('oak:path');
                node.removeAttribute('oak:path');
                node.setAttribute('oakPath', oakValue);
                node.setAttribute('oakParent', `{{oakFullpath}}`);
            }
        }
        if (node.nodeType === node.TEXT_NODE) {
            // 处理i18n 把t()转成i18n.t()
            if (existsT(node.nodeValue)) {
                const val = replaceT(node.nodeValue);
                const valArr = val.split('}}');
                let newVal = '';
                valArr.forEach((ele, index) => {
                    if (existsT(ele)) {
                        const head = ele.substring(0, ele.indexOf(')'));
                        const end = ele.substring(ele.indexOf(')'));
                        newVal +=
                            head +
                            `,${CURRENT_LOCALE_KEY},${CURRENT_LOCALE_DATA} || ''` +
                            end +
                            '}}';
                    } else if (ele && ele.indexOf("{{") !== -1) {
                        newVal += ele + '}}';
                    }
                    else {
                        newVal += ele;
                    }
                });
                node.deleteData(0, node.nodeValue.length);
                node.insertData(0, newVal);
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
