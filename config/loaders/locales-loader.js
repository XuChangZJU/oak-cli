
const {
    ROOT,
    SOURCE,
    DESTINATION,
    NODE_ENV,
} = require('./../env');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const parse = require('format-message-parse');
const { merge, set, get } = require('lodash');

const DEFAULT_WXS_FILENAME = 'locales.wxs';
const DEFAULT_JS_FILENAME = 'locales.js';
const READ_LOCALES_DIR = SOURCE + '/locales';
const WRITE_DIR = SOURCE + '/i18n';

const DEFAULT_LOCALE = 'zh-CN';
const DEFAULT_FALLBACK_LOCALE = 'zh-CN';
const CORE_PATH = path.dirname(
    require.resolve(
        '../../node_modules/oak-frontend-base/src/platforms/wechatMp/i18n/wxs/wxs.js'
    )
);
function getWxsCode() {
    const code = fs.readFileSync(path.join(CORE_PATH, '/wxs.js'), 'utf-8');
    const runner = `module.exports = { \nt: Interpreter.getMessageInterpreter() \n}`;
    return [code, runner].join('\n');
}

function i18nLocalesLoader() {
    const defaultLocale = DEFAULT_LOCALE;
    const fallbackLocale = DEFAULT_FALLBACK_LOCALE;
    const wxsContent = `${getWxsCode()}`;
    const translations = getTranslations(READ_LOCALES_DIR);
    const translationsStr = JSON.stringify(translations, null, 2);
    
    const jsContent = `module.exports = { \nfallbackLocale: '${fallbackLocale}', \ndefaultLocale:'${defaultLocale}', \ntranslations: ${translationsStr} \n};`;

    if (!checkFileExists(WRITE_DIR)) {
        fs.mkdirSync(WRITE_DIR);
    }
    fs.writeFileSync(WRITE_DIR + '/' + DEFAULT_JS_FILENAME, jsContent);
    fs.writeFileSync(WRITE_DIR + '/' + DEFAULT_WXS_FILENAME, wxsContent);
}



function getTranslations(source) {
    const paths = globby.sync([source]);
    const translations = {};

    if (paths && paths.length) {
        for (const p of paths) {
            // zh_CN/house.json
            const d = path2Escape(p).replace(path2Escape(source), '');
            const arr = d.split('/');
            const localeName = arr[1];
            const fileName = arr[2];
            const entityName = fileName.substring(0, fileName.lastIndexOf('.'));
            const json = readJsonSync(p);
            set(
                translations,
                `${localeName}.${entityName}`,
                parseTranslations(json)
            );
        }
    }

    return translations;
}

function path2Escape(str) {
    return str.replace(/\\/g, '/');
}

function readJsonSync(path) {
    const content = fs.readFileSync(path).toString('utf-8');
    return JSON.parse(content);
}

function checkFileExists(path) {
    return fs.existsSync(path);
}

function parseTranslations(object) {
    const keys = Object.keys(object);
    for (const key of keys) {
        const val = object[key];
        if (typeof val === 'string') {
            object[key] = parse(val);
        }
        if (typeof val === 'object') {
            object[key] = parseTranslations(val);
        }
    }
    return object;
}

module.exports = i18nLocalesLoader;