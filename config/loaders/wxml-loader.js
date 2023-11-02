/**
 *
 * @param {*} content 文件信息
 */
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const { resolve, relative, join } = require('path');
const { isUrlRequest, urlToRequest } = require('loader-utils');
const fs = require('fs');
const assert = require('assert');
const path = require('path');

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
    if (doc.attributes) {
        const { length } = doc.attributes;
        for (let i = 0; i < length; i++) {
            traverse(doc.attributes.item(i), callback);
        }
    }
}

const isSrc = (name) => name === 'src';

const isDynamicSrc = (src) => /\{\{/.test(src);
const oakMessage = 'oak-message';
const oakDebugPanel = 'oak-debugPanel';
const I18nModuleName = 'i18n';


function getAppJson(context) {
    const JSON_PATH = require.resolve(`${context}/app.json`);
    if (!fs.existsSync(JSON_PATH)) {
        return;
    }
    const data = fs.readFileSync(JSON_PATH, 'utf8');
    return JSON.parse(data);
}

//////////
const { parseSync, transformFromAstSync } = require('@babel/core');
const t = require('@babel/types');
const traverseAst = require('@babel/traverse').default;
/**
 * 判断代码段中是否有t()
 * @param {*} text 
 * @returns 
 */
function codeChunkIncludesT(text) {
    return /{{(\w|\W)*\W*t\((\w|\W)+\)(\w|\W)*}}/g.test(text)
}

/**
 * 改写代码段中的t()部分
 * @param {*} text 
 * @param {*} namespace 
 * @param {*} moduleName 
 * @returns 
 */
function transformCode(text, namespace, moduleName) {
    const codeChunkRegex = /(?:\{\{|%\{)(.*?)(?:\}\}?)/gm;
    const matches = text.match(codeChunkRegex);
    if (!matches) {
        return text;
    }

    let text2 = text;
    while (matches.length) {
        const codeChunk = matches.shift();
        if (codeChunkIncludesT(codeChunk)) {
            const codeContent = codeChunk.replace(codeChunkRegex, "$1");
            const ast = parseSync(codeContent);
            traverseAst(ast, {
                enter(path) {
                    if (path.isCallExpression()) {
                        const { node } = path;
                        if (t.isIdentifier(node.callee) && node.callee.name === 't') {
                            const { arguments } = node;
                            // 在t的后面加五个参数（oakLocales, oakLng, oakDefaultLng, oakNamespace, oakModule）
                            arguments.push(
                                t.identifier('oakLocales'),
                                t.identifier('oakLng'),
                                t.identifier('oakDefaultLng'),
                                t.stringLiteral(namespace),
                                t.stringLiteral(moduleName)
                            );
                            node.callee = t.memberExpression(
                                t.identifier('i18n'),
                                t.identifier('t')
                            );
                        }
                    }
                },
            });
            const { code } = transformFromAstSync(ast);
            assert(code.endsWith(';'));

            text2 = text2.replace(codeContent, code.slice(0, code.length - 1));
        }
    }
    return text2;
}
//////////

const ModuleNameDict = {};
// 根据当前处理的文件路径推导出wxs目录相对应的路径
function parseXmlFile(appRootPath, appRootSrcPath, appSrcPath, filePath) {
    // 目前所有的pages/components应当都位于appRootSrcPath下
    const isSelf = filePath.startsWith(appRootSrcPath);
    const filePath2 = filePath.replace(/\\/g, '/');

    const fileProjectPath = filePath2.replace(/((\w|\W)*)(\/src|\/lib|\/es)(\/pages\/|\/components\/)((\w|\W)*)/g, '$1');
    let moduleName = ModuleNameDict[fileProjectPath];
    if (!moduleName) {
        const { name } = require(join(fileProjectPath, 'package.json'));
        moduleName = ModuleNameDict[fileProjectPath] = name;
    }

    const relativePath = filePath2.replace(/(\w|\W)*(\/pages\/|\/components\/)((\w|\W)*)/g, '$3');
    assert(relativePath);
    const ns = `${moduleName}-${filePath.includes('pages') ? 'p' : 'c'}-${relativePath.replace(/\//g, '-')}`;

    let level = relativePath.split('/').length + 1;       // 加上pages的深度，未来根据isSelf还要进一步处理
    let wxsRelativePath = '';
    while (level-- > 0) {
        wxsRelativePath += '../';
    }
    wxsRelativePath += 'wxs';
    return {
        wxsRelativePath,
        ns,
        moduleName,
    };
}

module.exports = async function (content) {
    const options = this.getOptions() || {}; //获取配置参数
    const { appSrcPath, appRootPath, appRootSrcPath, cacheDirectory = true } = options; // context 本项目路径
    // loader的缓存功能
    this.cacheable && this.cacheable(cacheDirectory);
    const callback = this.async();
    const {
        options: webpackLegacyOptions,
        _module = {},
        _compilation = {},
        _compiler = {},
        resourcePath,
    } = this;
    const { output, mode } = _compiler.options;
    const { path: outputPath } = output;
    const { context: filePath, target } = webpackLegacyOptions || this;
    const issuer = _compilation.moduleGraph.getIssuer(this._module);
    const issuerContext = (issuer && issuer.context) || filePath;
    const root = resolve(filePath, issuerContext);
    let source = content;

    const {
        wxsRelativePath,
        ns,
        moduleName,
    } = parseXmlFile(appRootPath, appRootSrcPath, appSrcPath, filePath);
    const i18nWxsFile = `${wxsRelativePath}/${I18nModuleName}.wxs`;

    // 无条件注入i18n.wxs
    source = `<wxs src='${i18nWxsFile}' module='${I18nModuleName}'></wxs>\n<view change:prop="{{${I18nModuleName}.propObserver}}" prop="{{oakLocales}}" />\n` + source;

    // 注入全局message组件
    if (/pages/.test(filePath)) {
        const appJson = getAppJson(appSrcPath);
        if (
            appJson &&
            appJson.usingComponents &&
            appJson.usingComponents[oakMessage]
        ) {
            source = source + `\n <${oakMessage}></${oakMessage}>`;
        }
        if (
            mode !== 'production' &&
            appJson &&
            appJson.usingComponents &&
            appJson.usingComponents[oakDebugPanel]
        ) {
            source = source + `\n <${oakDebugPanel}></${oakDebugPanel}>`;
        }
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
        if (node.nodeType === node.ATTRIBUTE_NODE) {
            if (codeChunkIncludesT(node.value)) {
                const newVal = transformCode(node.value, ns, moduleName);
                node.value = newVal;
            }
        }
        if (node.nodeType === node.ELEMENT_NODE) {
            // xml存在src path路径
            if (node.hasAttribute('src')) {
                const value = node.getAttribute('src');
                if (
                    value &&
                    !isDynamicSrc(value) &&
                    isUrlRequest(value, root)
                ) {
                    if (i18nWxsFile === value) {
                        // dist目录下生成一个i18n/locales.wxs文件
                        /* const path = resolve(outputPath, WXS_PATH);
                        if (!fs.existsSync(replaceDoubleSlash(path))) {
                            const wxsContent = `${getWxsCode()}`;
                            this.emitFile(WXS_PATH, wxsContent);
                        } */
                    } else {
                        const path = resolve(root, value);
                        // const request = urlToRequest(value, root);
                        requests.push(path);
                    }
                }
            }

            // xml存在oakPath路径，如果有oakFullpath，加上不为undefined的判定
            if (node.hasAttribute("oakPath")) {
                const value = node.getAttribute('oakPath');

                if (value.includes('oakFullpath')) {
                    // 临时代码，去掉jichuang中原来的三元操作符
                    if (value.includes('?')) {
                        console.warn(`${filePath}，当前oakFullpath的有效性改成注入判定，不需要在代码中使用三元操作符处理为空的情况`);
                    }
                    if (node.parentNode.nodeName === 'block' && node.parentNode.hasAttribute('wx:if') && node.parentNode.getAttribute('wx:if').includes('oakFullpath')) {
                        const InjectedAttr = node.parentNode.getAttribute('oakInjected');
                        if (!InjectedAttr) {
                            console.warn(`${filePath}，当前oakFullpath的有效性改成注入判定，不需要在上层手动进行oakFullpath的判定`);
                        }
                    }
                    else {
                        const wxIfNode = node.ownerDocument.createElement('block');
                        wxIfNode.setAttribute('wx:if', '{{oakFullpath}}');
                        wxIfNode.setAttribute('oakInjected', 'true');
    
                        node.parentNode.replaceChild(wxIfNode, node);
                        wxIfNode.appendChild(node);
                    }
                }
            }
        }
        if (node.nodeType === node.TEXT_NODE) {
            if (codeChunkIncludesT(node.nodeValue)) {
                const newVal = transformCode(node.nodeValue, ns, moduleName);
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