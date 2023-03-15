const fs = require('fs-extra');
const Path = require('path');
const paths = require('../../config/web/paths');
const getClientEnvironment = require('../../config/web/env');
const env = getClientEnvironment();
const { buildLocales, mergeWebJsonFiles } = require('./build-locales');
const chalk = require('chalk');
const consola = require('consola');

const Locales = 'locales';

function copyLocaleFiles() {
    //build locales
    try {
        // locales到web/public下
        const buildPath = Path.resolve(paths.appPublic, Locales);
        consola.success(`${chalk.greenBright('读取locales，生成json数据')}`);
        const json = buildLocales({
            projectPaths: [
                paths.appRootSrc,
                paths.appSrc,
                paths.oakGeneralBusinessPath,
                paths.oakFrontendBasePath,
            ],
            buildPath,
            nodeEnv: env.raw.NODE_ENV,
            platform: env.raw.OAK_PLATFORM,
        });
        consola.success(
            `${chalk.greenBright('json数据已生成，准备写入json文件')}`
        );
        if (!fs.existsSync(buildPath)) {
            fs.mkdirSync(buildPath);
        } else {
            fs.emptyDirSync(buildPath);
        }
        mergeWebJsonFiles(json, buildPath);
        consola.success(
            `${chalk.greenBright(
                `json数据已写入文件，可以在${buildPath}目录下查看`
            )}`
        );
    } catch (e) {
        console.log(e);
        throw e;
    }
}

module.exports = {
    copyLocaleFiles,
};
