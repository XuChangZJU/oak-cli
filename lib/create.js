"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_handle_1 = require("./file-handle");
const enum_1 = require("./enum");
const config_1 = require("./config");
const template_1 = require("./template");
const path_1 = require("path");
const inquirer_1 = __importDefault(require("inquirer"));
const axios_1 = __importDefault(require("axios"));
const tip_style_1 = require("./tip-style");
const shelljs_1 = __importDefault(require("shelljs"));
const prompt = [
    {
        type: 'input',
        name: 'version',
        message: 'version',
        default: '1.0.0',
    },
    {
        type: 'input',
        name: 'description',
        message: 'description',
    },
];
/**
 * @name 检查项目名是否已存在
 * @param dirName
 */
function checkProjectName(dirName) {
    // 项目根路径
    const rootPath = process.cwd() + '/' + dirName;
    const isExists = (0, file_handle_1.checkFileExists)(rootPath);
    if (isExists) {
        console.error((0, tip_style_1.error)(`Cannot create a project named ${(0, tip_style_1.success)(`"${dirName}"`)} because a path with the same name exists.\n`) + (0, tip_style_1.error)('Please choose a different project name.'));
        process.exit(1);
    }
}
/**
 * @name 获取oak-cli最新版本号
 * @returns
 */
async function getOakCliVersion() {
    const res = await axios_1.default.get(config_1.CNPM_BASE_URL);
    return res.data['dist-tags']['latest'];
}
/**
 * @name 获取微信小程序稳定基础版本库
 * @returns
 */
async function getMiniVersion() {
    const res = await axios_1.default.get(config_1.MINI_VERSION_URL);
    const versions = JSON.parse(res.data['json_data'])['total'];
    const versionsSort = versions.sort((a, b) => {
        return b['percentage'] - a['percentage'];
    });
    return versionsSort[0]['sdkVer'];
}
async function create(dirName, cmd) {
    const nameOption = {
        type: 'input',
        name: 'name',
        message: `name`,
        default: dirName,
    };
    prompt.unshift(nameOption);
    const isDev = cmd.dev ? true : false;
    const { name, version, description } = await inquirer_1.default.prompt(prompt);
    // 获取微信小程序稳定基础版本库
    const miniVersion = await getMiniVersion();
    // 获取package.json内容
    const packageJson = (0, template_1.packageJsonContent)({
        name,
        version,
        description,
        cliversion: config_1.CLI_VERSION,
        cliname: config_1.CLI_NAME,
        isDev,
    });
    // 获取tsconfig.json内容
    const tsconfigJson = (0, template_1.tsConfigJsonContent)();
    // 获取小程序项目app.json内容
    const appJsonWithWeChatMp = (0, template_1.appJsonContentWithWeChatMp)(isDev);
    // 获取小程序项目project.config.json内容
    const projectConfigWithWeChatMp = (0, template_1.projectConfigContentWithWeChatMp)(config_1.USER_CONFIG_FILE_NAME, 'wechatMp', miniVersion);
    // 获取小程序项目oak.config.json内容
    const oakConfigWithWeChatMp = (0, template_1.oakConfigContentWithWeChatMp)();
    // 项目根路径
    const rootPath = process.cwd() + '/' + dirName;
    // package.json路径
    const packageJsonPath = `${rootPath}/package.json`;
    // tsconfig.json路径
    const tsconfigJsonPath = `${rootPath}/tsconfig.json`;
    // web项目根路径
    const webRootPath = `${rootPath}/web`;
    // 小程序项目根路径
    const weChatMpRootPath = `${rootPath}/wechatMp`;
    const appJsonPathWithWeChatMp = `${weChatMpRootPath}/src/app.json`;
    // 小程序项目project.config.json路径
    const projectConfigPathWithWeChatMp = `${weChatMpRootPath}/src/project.config.json`;
    // 小程序项目project.config.json路径
    const oakConfigPathWithWeChatMp = `${weChatMpRootPath}/src/${config_1.USER_CONFIG_FILE_NAME}`;
    // 被复制的文件夹路径
    const currentPath = (0, path_1.join)(__dirname, '..') + '/template';
    //检查项目名是否存在
    checkProjectName(dirName);
    try {
        // 创建根目录
        (0, file_handle_1.checkFileExistsAndCreate)(rootPath);
        // 创建package.json
        (0, file_handle_1.checkFileExistsAndCreate)(packageJsonPath, packageJson, enum_1.checkFileExistsAndCreateType.FILE);
        // 创建tsconfig.json
        (0, file_handle_1.checkFileExistsAndCreate)(tsconfigJsonPath, tsconfigJson, enum_1.checkFileExistsAndCreateType.FILE);
        // 复制项目文件
        (0, file_handle_1.copyFolder)(currentPath, rootPath);
        // 创建小程序项目project.config.json
        (0, file_handle_1.checkFileExistsAndCreate)(projectConfigPathWithWeChatMp, projectConfigWithWeChatMp, enum_1.checkFileExistsAndCreateType.FILE);
        // 创建小程序项目app.json
        (0, file_handle_1.checkFileExistsAndCreate)(appJsonPathWithWeChatMp, appJsonWithWeChatMp, enum_1.checkFileExistsAndCreateType.FILE);
        // 创建小程序项目oak.config.json
        (0, file_handle_1.checkFileExistsAndCreate)(oakConfigPathWithWeChatMp, oakConfigWithWeChatMp, enum_1.checkFileExistsAndCreateType.FILE);
        if (!shelljs_1.default.which('npm')) {
            (0, tip_style_1.Warn)((0, tip_style_1.warn)('Sorry, this script requires npm! Please install npm!'));
            shelljs_1.default.exit(1);
        }
        (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`Waiting...`)}`);
        (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`Dependencies are now being installed`)}`);
        shelljs_1.default.cd(dirName).exec('npm install');
        // checkFileExistsAndCreate(weChatMpRootPath + '/src/styles');
        // const data = readFile(
        //     `${rootPath}/node_modules/oak-general-business/src/platforms/wechatMp/styles/base.less`
        // );
        // checkFileExistsAndCreate(
        //     weChatMpRootPath + '/src/styles/base.less',
        //     data,
        //     checkFileExistsAndCreateType.FILE
        // );
        (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`Successfully created project ${(0, tip_style_1.primary)(name)}, directory name is ${(0, tip_style_1.primary)(dirName)}`)}`);
    }
    catch (err) {
        (0, tip_style_1.Error)((0, tip_style_1.error)('create error'));
        (0, tip_style_1.Error)((0, tip_style_1.error)(err));
    }
}
exports.default = create;
