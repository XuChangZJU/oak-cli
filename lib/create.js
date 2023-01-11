"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.create = void 0;
const tslib_1 = require("tslib");
const file_handle_1 = require("./file-handle");
const enum_1 = require("./enum");
const config_1 = require("./config");
const template_1 = require("./template");
const path_1 = require("path");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const tip_style_1 = require("./tip-style");
const shelljs_1 = tslib_1.__importDefault(require("shelljs"));
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
function checkProjectName(dirName, exists) {
    // 项目根路径
    const rootPath = process.cwd() + '/' + dirName;
    const isExists = (0, file_handle_1.checkFileExists)(rootPath);
    if (isExists && !exists) {
        throw new global.Error(`Cannot create a project named ${(0, tip_style_1.success)(`"${dirName}"`)} because a path with the same name exists.\nPlease choose a different project name.`);
    }
    else if (!isExists && exists) {
        throw new global.Error(`${(0, tip_style_1.success)(dirName)} is not a valid project dir.\nPlease choose a different project name.`);
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
async function createWechatMpBoilplate(dir, isDev, isUpdate) {
    // 获取微信小程序稳定基础版本库
    const miniVersion = await getMiniVersion();
    // 获取小程序项目app.json内容
    const appJsonWithWeChatMp = (0, template_1.appJsonContentWithWeChatMp)(isDev);
    // 获取小程序项目project.config.json内容
    const projectConfigWithWeChatMp = (0, template_1.projectConfigContentWithWeChatMp)(config_1.USER_CONFIG_FILE_NAME, 'wechatMp', miniVersion);
    // 获取小程序项目oak.config.json内容
    const oakConfigWithWeChatMp = (0, template_1.oakConfigContentWithWeChatMp)();
    const appJsonPathWithWeChatMp = (0, path_1.join)(dir, 'src', 'app.json');
    // 小程序项目project.config.json路径
    const projectConfigPathWithWeChatMp = (0, path_1.join)(dir, 'src', 'project.config.json');
    // 小程序项目project.config.json路径
    const oakConfigPathWithWeChatMp = (0, path_1.join)(dir, 'src', config_1.USER_CONFIG_FILE_NAME);
    // 创建小程序项目project.config.json
    (0, file_handle_1.checkFileExistsAndCreate)(projectConfigPathWithWeChatMp, projectConfigWithWeChatMp, enum_1.checkFileExistsAndCreateType.FILE, isUpdate);
    // 创建小程序项目app.json
    (0, file_handle_1.checkFileExistsAndCreate)(appJsonPathWithWeChatMp, appJsonWithWeChatMp, enum_1.checkFileExistsAndCreateType.FILE, isUpdate);
    // 创建小程序项目oak.config.json
    (0, file_handle_1.checkFileExistsAndCreate)(oakConfigPathWithWeChatMp, oakConfigWithWeChatMp, enum_1.checkFileExistsAndCreateType.FILE, isUpdate);
}
async function createWebBoilplate(dir, isDev, isUpdate) {
    // 获取web项目app.json内容
    const appJsonWithWeb = (0, template_1.appJsonContentWithWeb)(isDev);
    // 获取web项目oak.config.json内容
    const oakConfigWithWeb = (0, template_1.oakConfigContentWithWeb)();
    const appJsonPathWithWeb = (0, path_1.join)(dir, 'src', 'app.json');
    // web项目oak.config.json路径
    const oakConfigPathWithWeb = (0, path_1.join)(dir, 'src', config_1.USER_CONFIG_FILE_NAME);
    // 创建小程序项目app.json
    (0, file_handle_1.checkFileExistsAndCreate)(appJsonPathWithWeb, appJsonWithWeb, enum_1.checkFileExistsAndCreateType.FILE, isUpdate);
    // 创建小程序项目oak.config.json
    (0, file_handle_1.checkFileExistsAndCreate)(oakConfigPathWithWeb, oakConfigWithWeb, enum_1.checkFileExistsAndCreateType.FILE, isUpdate);
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
    // 获取package.json内容
    const packageJson = (0, template_1.packageJsonContent)({
        name,
        version,
        description,
        cliVersion: config_1.CLI_VERSION,
        cliName: config_1.CLI_NAME,
        cliBinName: config_1.CLI_BIN_NAME,
        isDev,
    });
    // 获取tsconfig.json内容
    const tsconfigJson = (0, template_1.tsConfigJsonContent)();
    const tsConfigBuildJson = (0, template_1.tsConfigBuildJsonContent)();
    const tsConfigPathsJson = (0, template_1.tsConfigPathsJsonContent)();
    const tsConfigMpJson = (0, template_1.tsConfigMpJsonContent)();
    const tsConfigWebJson = (0, template_1.tsConfigWebJsonContent)();
    // 项目根路径
    const rootPath = process.cwd() + '/' + dirName;
    // package.json路径
    const packageJsonPath = `${rootPath}/package.json`;
    // tsconfig.json路径
    const tsconfigJsonPath = `${rootPath}/tsconfig.json`;
    // tsconfig.build.json路径
    const tsConfigBuildJsonPath = `${rootPath}/tsconfig.build.json`;
    // tsconfig.paths.json路径
    const tsconfigPathsJsonPath = `${rootPath}/tsconfig.paths.json`;
    // tsconfig.mp.json路径
    const tsConfigMpJsonPath = `${rootPath}/tsconfig.mp.json`;
    // tsconfig.web.json路径
    const tsConfigWebJsonPath = `${rootPath}/tsconfig.web.json`;
    // web项目根路径
    const webRootPath = `${rootPath}/web`;
    // 小程序项目根路径
    const weChatMpRootPath = `${rootPath}/wechatMp`;
    // 被复制的文件夹路径
    const currentPath = (0, path_1.join)(__dirname, '..', 'template');
    //检查项目名是否存在
    checkProjectName(dirName);
    try {
        // 创建根目录
        (0, file_handle_1.checkFileExistsAndCreate)(rootPath);
        // 创建package.json
        (0, file_handle_1.checkFileExistsAndCreate)(packageJsonPath, packageJson, enum_1.checkFileExistsAndCreateType.FILE);
        // 创建tsconfig.json
        (0, file_handle_1.checkFileExistsAndCreate)(tsconfigJsonPath, tsconfigJson, enum_1.checkFileExistsAndCreateType.FILE);
        // 创建tsconfig.build.json
        (0, file_handle_1.checkFileExistsAndCreate)(tsConfigBuildJsonPath, tsConfigBuildJson, enum_1.checkFileExistsAndCreateType.FILE);
        // 创建tsconfig.paths.json
        (0, file_handle_1.checkFileExistsAndCreate)(tsconfigPathsJsonPath, tsConfigPathsJson, enum_1.checkFileExistsAndCreateType.FILE);
        // 创建tsconfig.mp.json
        (0, file_handle_1.checkFileExistsAndCreate)(tsConfigMpJsonPath, tsConfigMpJson, enum_1.checkFileExistsAndCreateType.FILE);
        // 创建tsconfig.web.json
        (0, file_handle_1.checkFileExistsAndCreate)(tsConfigWebJsonPath, tsConfigWebJson, enum_1.checkFileExistsAndCreateType.FILE);
        // 复制项目文件
        (0, file_handle_1.copyFolder)(currentPath, rootPath);
        await createWechatMpBoilplate(weChatMpRootPath, isDev);
        await createWebBoilplate(webRootPath, isDev);
        if (!shelljs_1.default.which('npm')) {
            (0, tip_style_1.Warn)((0, tip_style_1.warn)('Sorry, this script requires npm! Please install npm!'));
            shelljs_1.default.exit(1);
        }
        /* Success(`${success(`Waiting...`)}`);
        Success(`${success(`Dependencies are now being installed`)}`);
        shell.cd(dirName).exec('npm install'); */
        (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`Successfully created project ${(0, tip_style_1.primary)(name)}, directory name is ${(0, tip_style_1.primary)(dirName)}`)}`);
    }
    catch (err) {
        (0, tip_style_1.Error)((0, tip_style_1.error)('create error'));
        (0, tip_style_1.Error)((0, tip_style_1.error)(err));
    }
}
exports.create = create;
async function update(dirName, subDirName, cmd) {
    const isDev = cmd.dev ? true : false;
    try {
        // 需要拷贝的路径
        const destPath = (0, path_1.join)(process.cwd(), dirName, subDirName);
        const templatePath = (0, path_1.join)(__dirname, '..', 'template');
        //检查项目名是否存在
        checkProjectName(dirName, true);
        if (subDirName === 'src') {
            const fromPath = (0, path_1.join)(templatePath, subDirName);
            (0, file_handle_1.copyFolder)(fromPath, destPath, true);
        }
        else if (subDirName.startsWith('wechatMp')) {
            const fromPath = (0, path_1.join)(templatePath, 'wechatMp');
            (0, file_handle_1.copyFolder)(fromPath, destPath, true);
            await createWechatMpBoilplate(destPath, isDev, true);
        }
        else {
            throw new global.Error(`Cannot recoganize ${(0, tip_style_1.success)(`"${subDirName}"`)} for update.\n Please choose src/wechatMp%.`);
        }
        (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`Successfully update directory ${(0, tip_style_1.primary)(subDirName)} for project ${(0, tip_style_1.primary)(dirName)}}`)}`);
    }
    catch (err) {
        console.error((0, tip_style_1.error)(err.message));
    }
}
exports.update = update;
