import {
    copyFolder,
    checkFileExistsAndCreate,
    readFile,
    checkFileExists,
} from './file-handle';
import { checkFileExistsAndCreateType } from './enum';
import {
    CNPM_BASE_URL,
    CLI_VERSION,
    USER_CONFIG_FILE_NAME,
    CLI_NAME,
    MINI_VERSION_URL,
} from './config';
import {
    packageJsonContent,
    tsConfigJsonContent,
    appJsonContentWithWeChatMp,
    projectConfigContentWithWeChatMp,
    oakConfigContentWithWeChatMp,
} from './template';
import { PromptInput, OakInput } from './interface';
import { join } from 'path';
import inquirer from 'inquirer';
import axios from 'axios';
import {
    Success,
    Error,
    error,
    primary,
    success,
    warn,
    Warn,
} from './tip-style';
import shell from 'shelljs';

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
function checkProjectName(dirName: string) {
    // 项目根路径
    const rootPath = process.cwd() + '/' + dirName;
    const isExists = checkFileExists(rootPath);
    if (isExists) {
        console.error(
            error(
                `Cannot create a project named ${success(
                    `"${dirName}"`
                )} because a path with the same name exists.\n`
            ) + error('Please choose a different project name.')
        );
        process.exit(1);
    }
}

/**
 * @name 获取oak-cli最新版本号
 * @returns
 */
async function getOakCliVersion() {
    const res = await axios.get(CNPM_BASE_URL);
    return res.data['dist-tags']['latest'];
}

/**
 * @name 获取微信小程序稳定基础版本库
 * @returns
 */
async function getMiniVersion() {
    const res = await axios.get(MINI_VERSION_URL);
    const versions: Array<any> = JSON.parse(res.data['json_data'])['total'];
    const versionsSort = versions.sort((a: any, b: any) => {
        return b['percentage'] - a['percentage'];
    });
    return versionsSort[0]['sdkVer'];
}

export default async function create(dirName: string, env: string) {
    const nameOption = {
        type: 'input',
        name: 'name',
        message: `name`,
        default: dirName,
    };
    prompt.unshift(nameOption);

    const isDev = env === 'dev' || env === 'development';

    const { name, version, description }: PromptInput = await inquirer.prompt(
        prompt
    );
    // 获取微信小程序稳定基础版本库
    const miniVersion = await getMiniVersion();
    // 获取package.json内容
    const packageJson = packageJsonContent({
        name,
        version,
        description,
        cliversion: CLI_VERSION,
        cliname: CLI_NAME,
        isDev,
    });

    // 获取tsconfig.json内容
    const tsconfigJson = tsConfigJsonContent();

    // 获取小程序项目app.json内容
    const appJsonWithWeChatMp = appJsonContentWithWeChatMp(isDev);
    // 获取小程序项目project.config.json内容
    const projectConfigWithWeChatMp = projectConfigContentWithWeChatMp(
        USER_CONFIG_FILE_NAME,
        'wechatMp',
        miniVersion
    );
    // 获取小程序项目oak.config.json内容
    const oakConfigWithWeChatMp = oakConfigContentWithWeChatMp();
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
    const oakConfigPathWithWeChatMp = `${weChatMpRootPath}/src/${USER_CONFIG_FILE_NAME}`;
    // 被复制的文件夹路径
    const currentPath = join(__dirname, '..') + '/template';
    //检查项目名是否存在
    checkProjectName(dirName);
    try {
        // 创建根目录
        checkFileExistsAndCreate(rootPath);
        // 创建package.json
        checkFileExistsAndCreate(
            packageJsonPath,
            packageJson,
            checkFileExistsAndCreateType.FILE
        );
        // 创建tsconfig.json
        checkFileExistsAndCreate(
            tsconfigJsonPath,
            tsconfigJson,
            checkFileExistsAndCreateType.FILE
        );
        // 复制项目文件
        copyFolder(currentPath, rootPath);
        // 创建小程序项目project.config.json
        checkFileExistsAndCreate(
            projectConfigPathWithWeChatMp,
            projectConfigWithWeChatMp,
            checkFileExistsAndCreateType.FILE
        );
        // 创建小程序项目app.json
        checkFileExistsAndCreate(
            appJsonPathWithWeChatMp,
            appJsonWithWeChatMp,
            checkFileExistsAndCreateType.FILE
        );
        // 创建小程序项目oak.config.json
        checkFileExistsAndCreate(
            oakConfigPathWithWeChatMp,
            oakConfigWithWeChatMp,
            checkFileExistsAndCreateType.FILE
        );
        if (!shell.which('npm')) {
            Warn(warn('Sorry, this script requires npm! Please install npm!'));
            shell.exit(1);
        }
        Success(`${success(`Waiting...`)}`);
        Success(`${success(`Dependencies are now being installed`)}`);
        shell.cd(dirName).exec('npm install');

        // checkFileExistsAndCreate(weChatMpRootPath + '/src/styles');
        // const data = readFile(
        //     `${rootPath}/node_modules/oak-general-business/src/platforms/wechatMp/styles/base.less`
        // );
        // checkFileExistsAndCreate(
        //     weChatMpRootPath + '/src/styles/base.less',
        //     data,
        //     checkFileExistsAndCreateType.FILE
        // );

        Success(
            `${success(
                `Successfully created project ${primary(
                    name
                )}, directory name is ${primary(dirName)}`
            )}`
        );
    } catch (err) {
        Error(error('create error'));
        Error(error(err));
    }
}
