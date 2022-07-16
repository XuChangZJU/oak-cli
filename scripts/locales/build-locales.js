
const fs = require('fs-extra');
const Path = require('path');

const { merge, get, set, setWith } = require('lodash');

function buildLocales(projectPath, businessProjectPath, buildPath) {
    const dataJson = {};
    readProject(dataJson, projectPath, true, true, buildPath);

    readProject(dataJson, businessProjectPath, false, true, buildPath);

    return dataJson;
}

function readProject(json, projectPath, hasDomain, hasCommon, buildPath) {
    // 读取oak-app-domain/_locales
    if (hasDomain) {
        const domainLocalesPath = Path.resolve(
            projectPath,
            'oak-app-domain/_locales'
        );
        readLocaleFiles(json, domainLocalesPath);
    }

    //
    if (hasCommon) {
        const localesPath = Path.resolve(projectPath, 'locales');
        findLocales(json, localesPath);
    }

    const pagesPath = Path.resolve(projectPath, 'pages');
    findPages(json, pagesPath);
    listenerFiles(pagesPath, buildPath);

    const componentsPath = Path.resolve(projectPath, 'components');
    findPages(json, componentsPath);
}

function readLocaleFiles(json, path, name) {
    if (!fs.existsSync(path)) {
        return;
    }
    const files = fs.readdirSync(path);
    files.forEach((val, index) => {
        const lng = val.substring(val, val.indexOf('.'));
        let fPath = Path.resolve(path, val);
        const locales = require(fPath).default;
        setWith(json, name ? `${lng}.${name}` : lng, locales, Object);
    });
}

// pages /house/locales/zh-CN.ts 或者 /house/list/locales/zh-CN.ts
function findPages(json, path, name = '') {
    if (!fs.existsSync(path)) {
        return;
    }
    const files = fs.readdirSync(path);
    files
        .filter(
            (ele) =>
                !['.DS_Store', 'index.ts'].includes(ele) &&
                !/\.(json|less|jsx|tsx|wxml)$/.test(ele)
        )
        .forEach((val, index) => {
            let fPath = Path.resolve(path, val);
            let stats = fs.statSync(fPath);
            if (stats.isDirectory()) {
                // 文件夹
                if (val === 'locales') {
                    readLocaleFiles(json, fPath, name);
                } else {
                    const name2 = getName(val);
                    findPages(json, fPath, name ? `${name}-${name2}` : name2);
                }
            }
        });
}

// locales /Common/zh-CN.ts   应该没有这种/common/xx/zh-CN.ts
function findLocales(json, path, name = '') {
    if (!fs.existsSync(path)) {
        return;
    }
    const files = fs.readdirSync(path);
    files.forEach((val, index) => {
        let fPath = Path.join(path, val);
        let stats = fs.statSync(fPath);

        if (stats.isDirectory()) {
            // 文件夹
            const name2 = getName(val);
            findLocales(json, fPath, name ? `${name}-${name2}` : name2);
        }

        if (stats.isFile()) {
            readLocaleFiles(json, path, name);
        }
    });
}

function listenerFiles(path, buildPath) {
    fs.watch(path, { recursive: true }, (eventType, filename) => {
        console.log('\nThe file', filename, 'was modified!');
        console.log('The type of change was:', eventType);

        if (
            /(\/_locales\/)/.test(filename) ||
            /(\/locales\/)|/.test(filename)
        ) {
            if (eventType === 'change') {
                //文件内容改变
                const { name, lng } = getNameAndLng(filename);
                let fPath = Path.resolve(path, filename);
                // 需要换成json文件
                const locales = require(fPath).default;
                const d = fs.readFileSync(fPath);
                const json = {};
                setWith(json, name ? `${lng}.${name}` : lng, locales, Object);
                mergeJsonFiles(json, buildPath, true);
            }
        }
    });
}

function getName(val) {
    const name = val.substring(0, 1).toLowerCase() + val.substring(1);
    return name;
}

function getNameAndLng(path) {
    let name = '';
    let lng = '';

    const arr = path.split('/').filter(ele => !!ele);

    let isLocales = false;
    for (let n of arr) {
        if (isLocales) {
            lng = n.substring(n, n.indexOf('.'));
        } else if (n === 'locales') {
            isLocales = true;
        } else {
            const name2 = getName(n);
            name = name ? `${name}-${name2}` : name2;
        }
    }

    return {
        name,
        lng,
    };
}

//
function mergeJsonFiles(json, buildPath, isMerge) {
    for (let lng in json) {
        // lng生成文件夹
        const lngPath = Path.resolve(buildPath, lng);
        if (!fs.existsSync(lngPath)) {
            fs.mkdirSync(lngPath);
        }

        const entityJson = json[lng] || {};
        // 覆盖entity.json
        for (let entity in entityJson) {
            const entityPath = Path.resolve(lngPath, `${entity}.json`);
            const data = entityJson[entity] || {};
            let dataJson = {};
            if (isMerge) {
                if (fs.existsSync(entityPath)) {
                    dataJson = fs.readJSONSync(entityPath);
                }
            }
            merge(dataJson, data);
            fs.writeFileSync(entityPath, JSON.stringify(dataJson, null, 2));
        }
    }
}


// 生成json文件
function generateJsonFiles(buildPath, json) {
    if (!fs.existsSync(buildPath)) {
        fs.mkdirSync(buildPath);
    } else {
        fs.emptyDirSync(buildPath);
    }
    mergeJsonFiles(json, buildPath, false);
}


module.exports = {
    buildLocales,
    generateJsonFiles,
};