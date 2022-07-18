
const fs = require('fs-extra');
const Path = require('path');

const { merge, get, set, setWith } = require('lodash');

const oakRegex =
    /(\/*[a-zA-Z0-9_-])*\/app\/(pages|components)\/|(\\*[a-zA-Z0-9_-])*\\app\\(pages|components)\\/;
const localRegex =
    /(\/*[a-zA-Z0-9_-])*\/src\/(pages|components)+\/|(\\*[a-zA-Z0-9_-])*\\src\/(pages|components)+\\/;

function getName(val) {
    const name = val.substring(0, 1).toLowerCase() + val.substring(1);
    return name;
}

function getNameAndLng(path) {
    let name = '';
    let lng = '';

    const arr = path.split('/').filter((ele) => !!ele);

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

function buildLocales({
    projectPath,
    businessProjectPath,
    buildPath,
    nodeEnv,
    platform,
}) {
    const dataJson = {};
    const projectPaths = [projectPath, businessProjectPath];
    projectPaths.forEach((path) => {
        readProject(dataJson, path, buildPath, nodeEnv, platform);
    });
    return dataJson;
}

function readProject(json, projectPath, buildPath, nodeEnv, platform) {
    // 读取oak-app-domain/
    const domainLocalesPath = Path.resolve(
        projectPath,
        'oak-app-domain'
    ).replace(/\\/g, '/');
    findLocaleFiles(json, domainLocalesPath, '', buildPath, nodeEnv, platform);

    // 读取business/locales
    const localesPath = Path.resolve(projectPath, 'locales').replace(
        /\\/g,
        '/'
    );
    findLocaleFiles(json, localesPath, '', buildPath, nodeEnv, platform);

    const pagesPath = Path.resolve(projectPath, 'pages').replace(/\\/g, '/');
    findLocaleFiles(json, pagesPath, '', buildPath, nodeEnv, platform);

    const componentsPath = Path.resolve(projectPath, 'components').replace(
        /\\/g,
        '/'
    );
    findLocaleFiles(json, componentsPath, '', buildPath, nodeEnv, platform);
}

function readLocaleFiles(json, path, name) {
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
function findLocaleFiles(json, path, name = '', buildPath, nodeEnv, platform) {
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
                    readLocaleFiles(json, fPath, name);
                    //监听locales文件夹
                    if (nodeEnv !== 'production') {
                        listenerLocaleFiles(fPath, buildPath, nodeEnv, platform);
                    }
                } else {
                    const name2 = getName(val);
                    findLocaleFiles(
                        json,
                        fPath,
                        name ? `${name}-${name2}` : name2,
                        buildPath,
                        nodeEnv,
                        platform
                    );
                }
            }
        });
}

function listenerLocaleFiles(path, buildPath, nodeEnv, platform) {
    fs.watch(path, { recursive: true }, (eventType, filename) => {
        const fPath = Path.resolve(path, filename).replace(/\\/g, '/');
        console.log('\nThe file', fPath, 'was modified!');
        console.log('The type of change was:', eventType);

        if (/(\/locales\/)|/.test(filename) && /\.(json)$/.test(filename)) {
            if (eventType === 'change') {
                //文件内容改变
                const newFilename = fPath.replace(oakRegex, '').replace(localRegex, '');
                const { name, lng } = getNameAndLng(newFilename);

                const dataJson = fs.readJsonSync(fPath);
                const newJson = {};
                setWith(
                    newJson,
                    name ? `${lng}.${name}` : lng,
                    dataJson,
                    Object
                );
                if (platform === 'wechatMp') {
                    mergeMpJsonFiles(newJson, buildPath, true);
                } else {
                    mergeWebJsonFiles(newJson, buildPath, true);
                }
                
            }
        }
    });
}

//
function mergeWebJsonFiles(json, buildPath, isMerge) {
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

function mergeMpJsonFiles(json, buildPath, isMerge) {
    for (let lng in json) {
        // lng生成文件夹
        const lngPath = Path.resolve(buildPath, `${lng}.json`);

        const data = json[lng] || {};
         let dataJson = {};
         if (isMerge) {
             if (fs.existsSync(lngPath)) {
                 dataJson = fs.readJSONSync(lngPath);
             }
         }
         merge(dataJson, data);
         fs.writeFileSync(lngPath, JSON.stringify(dataJson, null, 2));
    }
}


module.exports = {
    buildLocales,
    mergeWebJsonFiles,
    mergeMpJsonFiles,
};