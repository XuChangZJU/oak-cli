
const fs = require('fs-extra');
const Path = require('path');

const { merge, get, set, setWith } = require('lodash');

const Mode = {
    domain: 'domain',
    common: 'common',
    entity: 'entity',
};

function buildLocales(projectPath, businessProjectPath, buildPath) {
    const dataJson = {};
    readProject(dataJson, projectPath, true, true, buildPath);

    readProject(dataJson, businessProjectPath, false, true, buildPath);

    return dataJson;
}

function readProject(json, projectPath, hasDomain, hasCommon, buildPath) {
    // 读取oak-app-domain/
    if (hasDomain) {
        const domainLocalesPath = Path.resolve(
            projectPath,
            'oak-app-domain'
        ).replace(/\\/g, '/');
        findFiles(json, domainLocalesPath, '', Mode.domain);
    }

    // 读取business
    if (hasCommon) {
        const localesPath = Path.resolve(projectPath, 'locales').replace(
            /\\/g,
            '/'
        );
        findLocales(json, localesPath, '', Mode.common);
    }

    const pagesPath = Path.resolve(projectPath, 'pages').replace(/\\/g, '/');
    findFiles(json, pagesPath, '', Mode.entity);
    // listenerFiles(pagesPath, buildPath);

    const componentsPath = Path.resolve(projectPath, 'components').replace(
        /\\/g,
        '/'
    );
    findFiles(json, componentsPath, '', Mode.entity);
}

function readLocaleFiles(json, path, name, mode) {
    if (!fs.existsSync(path)) {
        return;
    }
    const files = fs.readdirSync(path);
    files.forEach((val, index) => {
        const lng = val.substring(val, val.indexOf('.'));
        const fPath = Path.resolve(path, val).replace(/\\/g, '/');
        const dataJson = fs.readJsonSync(fPath);
        setWith(json, name ? `${lng}.${name}` : lng, dataJson, Object);
    });
}

// pages /house/locales/zh-CN.json 或者 /house/list/locales/zh-CN.json  或者 oak-app-domain
function findFiles(json, path, name = '', mode) {
    if (!fs.existsSync(path)) {
        return;
    }
    const files = fs.readdirSync(path);
    files
        .filter(
            (ele) =>
                !['.DS_Store', 'package.json'].includes(ele) &&
                !/\.(ts|less|jsx|tsx|wxml)$/.test(ele)
        )
        .forEach((val, index) => {
            let fPath = Path.resolve(path, val).replace(/\\/g, '/');
            let stats = fs.statSync(fPath);
            if (stats.isDirectory()) {
                // 文件夹
                if (val === 'locales') {
                    readLocaleFiles(json, fPath, name, mode);
                } else {
                    const name2 = getName(val);
                    findFiles(
                        json,
                        fPath,
                        name ? `${name}-${name2}` : name2,
                        mode
                    );
                }
            }
        });
}

// locales /Common/zh-CN.json   应该没有这种/common/xx/zh-CN.json
function findLocales(json, path, name = '', mode) {
    if (!fs.existsSync(path)) {
        return;
    }
    const files = fs.readdirSync(path);
    files.forEach((val, index) => {
        let fPath = Path.join(path, val).replace(/\\/g, '/');
        let stats = fs.statSync(fPath);

        if (stats.isDirectory()) {
            // 文件夹
            const name2 = getName(val);
            findLocales(json, fPath, name ? `${name}-${name2}` : name2, mode);
        }

        if (stats.isFile()) {
            readLocaleFiles(json, path, name, mode);
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
                let fPath = Path.resolve(path, filename).replace(/\\/g, '/');
                // 需要换成json文件
                const locales = fs.readJsonSync(fPath);
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