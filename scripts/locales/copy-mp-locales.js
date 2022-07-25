const fs = require('fs-extra');
const Path = require('path');
const paths = require('../../config/mp/paths');
const getClientEnvironment = require('../../config/mp/env');
const env = getClientEnvironment();
const { buildLocales, mergeMpJsonFiles } = require('./build-locales');
const chalk = require('chalk');
const consola = require('consola');

const Locales = 'locales';

function copyLocaleFiles() {
    //build locales
    consola.success(`${chalk.greenBright('读取locales，生成json数据')}`);
    // locales到mp/dist下
    const buildPath = Path.resolve(paths.appBuild, Locales);
    const json = buildLocales({
        projectPath: paths.appRootSrc,
        businessProjectPath: paths.oakGeneralBusinessAppPath,
        buildPath,
        nodeEnv: env.raw.NODE_ENV,
        platform: env.raw.OAK_PLATFORM,
    });
    consola.success(`${chalk.greenBright('json数据已生成，准备写入json文件')}`);
    if (!fs.existsSync(buildPath)) {
        fs.mkdirSync(buildPath);
    } else {
        fs.emptyDirSync(buildPath);
    }
    mergeMpJsonFiles(json, buildPath);
    consola.success(
        `${chalk.greenBright(
            `json数据已写入文件，可以在${buildPath}目录下查看`
        )}`
    );
}

module.exports = {
    copyLocaleFiles,
};
