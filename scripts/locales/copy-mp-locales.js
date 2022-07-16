const fs = require('fs-extra');
const Path = require('path');
const paths = require('../../config/mp/paths');
const { buildLocales, generateJsonFiles } = require('./build-locales');
const chalk = require('chalk');
const consola = require('consola');

const Locales = 'locales';

function copyLocaleFiles() {
    //build locales
    consola.start(`${chalk.blueBright('读取locales，生成json数据')}`);
    const json = buildLocales(
        paths.appRootSrc,
        paths.oakGeneralBusinessAppPath
    );
    consola.success(`${chalk.greenBright('json数据已生成，准备写入json文件')}`);
    // locales到mp/dist下
    const buildPath = Path.resolve(paths.appBuild, Locales);
    generateJsonFiles(buildPath, json);
    consola.success(
        `${chalk.greenBright(
            `json数据已写入文件，可以在${buildPath}目录下查看`
        )}`
    );
}

module.exports = {
    copyLocaleFiles,
};
