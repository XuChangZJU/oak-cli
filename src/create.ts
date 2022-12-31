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
    CLI_BIN_NAME,
} from './config';
import {
    packageJsonContent,
    tsConfigJsonContent,
    tsConfigBuildJsonContent,
    tsConfigPathsJsonContent,
    tsConfigMpJsonContent,
    tsConfigWebJsonContent,
    appJsonContentWithWeChatMp,
    projectConfigContentWithWeChatMp,
    oakConfigContentWithWeChatMp,
    appJsonContentWithWeb,
    oakConfigContentWithWeb,
} from './template';
import { PromptInput } from './interface';
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
function checkProjectName(dirName: string, exists?: true) {
    // 项目根路径
    const rootPath = process.cwd() + '/' + dirName;
    const isExists = checkFileExists(rootPath);
    if (isExists && !exists) {
        throw new global.Error(`Cannot create a project named ${success(
            `"${dirName}"`
        )} because a path with the same name exists.\nPlease choose a different project name.`);
    }
    else if (!isExists && exists) {
        throw new global.Error(`${success(dirName)} is not a valid project dir.\nPlease choose a different project name.`)
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


async function createWechatMpBoilplate(dir: string, isDev: boolean, isUpdate?: boolean) {
    // 获取微信小程序稳定基础版本库
    const miniVersion = await getMiniVersion();
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

    const appJsonPathWithWeChatMp = join(dir, 'src', 'app.json');

    // 小程序项目project.config.json路径
    const projectConfigPathWithWeChatMp = join(dir, 'src', 'project.config.json');
    // 小程序项目project.config.json路径
    const oakConfigPathWithWeChatMp = join(dir, 'src', USER_CONFIG_FILE_NAME);
    // 创建小程序项目project.config.json
    checkFileExistsAndCreate(
        projectConfigPathWithWeChatMp,
        projectConfigWithWeChatMp,
        checkFileExistsAndCreateType.FILE,
        isUpdate
    );
    // 创建小程序项目app.json
    checkFileExistsAndCreate(
        appJsonPathWithWeChatMp,
        appJsonWithWeChatMp,
        checkFileExistsAndCreateType.FILE,
        isUpdate
    );
    // 创建小程序项目oak.config.json
    checkFileExistsAndCreate(
        oakConfigPathWithWeChatMp,
        oakConfigWithWeChatMp,
        checkFileExistsAndCreateType.FILE,
        isUpdate
    );
}

async function createWebBoilplate(
    dir: string,
    isDev: boolean,
    isUpdate?: boolean
) {
    // 获取web项目app.json内容
    const appJsonWithWeb = appJsonContentWithWeb(isDev);

    // 获取web项目oak.config.json内容
    const oakConfigWithWeb = oakConfigContentWithWeb();

    const appJsonPathWithWeb = join(dir, 'src', 'app.json');

    // web项目oak.config.json路径
    const oakConfigPathWithWeb = join(dir, 'src', USER_CONFIG_FILE_NAME);

    // 创建小程序项目app.json
    checkFileExistsAndCreate(
        appJsonPathWithWeb,
        appJsonWithWeb,
        checkFileExistsAndCreateType.FILE,
        isUpdate
    );
    // 创建小程序项目oak.config.json
    checkFileExistsAndCreate(
        oakConfigPathWithWeb,
        oakConfigWithWeb,
        checkFileExistsAndCreateType.FILE,
        isUpdate
    );
}

export async function create(dirName: string, cmd: any) {
    const nameOption = {
        type: 'input',
        name: 'name',
        message: `name`,
        default: dirName,
    };
    prompt.unshift(nameOption);
    const isDev = cmd.dev ? true : false;

    const { name, version, description }: PromptInput = await inquirer.prompt(
        prompt
    );
    // 获取package.json内容
    const packageJson = packageJsonContent({
        name,
        version,
        description,
        cliVersion: CLI_VERSION,
        cliName: CLI_NAME,
        cliBinName: CLI_BIN_NAME,
        isDev,
    });

    // 获取tsconfig.json内容
    const tsconfigJson = tsConfigJsonContent();
    const tsConfigBuildJson = tsConfigBuildJsonContent();
    const tsConfigPathsJson = tsConfigPathsJsonContent();
    const tsConfigMpJson = tsConfigMpJsonContent();
    const tsConfigWebJson = tsConfigWebJsonContent();

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
    const currentPath = join(__dirname, '..', 'template');
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
        // 创建tsconfig.build.json
        checkFileExistsAndCreate(
            tsConfigBuildJsonPath,
            tsConfigBuildJson,
            checkFileExistsAndCreateType.FILE
        );
        // 创建tsconfig.paths.json
        checkFileExistsAndCreate(
            tsconfigPathsJsonPath,
            tsConfigPathsJson,
            checkFileExistsAndCreateType.FILE
        );
        // 创建tsconfig.mp.json
        checkFileExistsAndCreate(
            tsConfigMpJsonPath,
            tsConfigMpJson,
            checkFileExistsAndCreateType.FILE
        );
        // 创建tsconfig.web.json
        checkFileExistsAndCreate(
            tsConfigWebJsonPath,
            tsConfigWebJson,
            checkFileExistsAndCreateType.FILE
        );
        // 复制项目文件
        copyFolder(currentPath, rootPath);

        await createWechatMpBoilplate(weChatMpRootPath, isDev);
        await createWebBoilplate(webRootPath, isDev);
        if (!shell.which('npm')) {
            Warn(warn('Sorry, this script requires npm! Please install npm!'));
            shell.exit(1);
        }
        /* Success(`${success(`Waiting...`)}`);
        Success(`${success(`Dependencies are now being installed`)}`);
        shell.cd(dirName).exec('npm install'); */

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


export async function update(dirName: string, subDirName: string, cmd: any) {
    const isDev = cmd.dev ? true : false;

    try {
        // 需要拷贝的路径
        const destPath = join(process.cwd(), dirName, subDirName);

        const templatePath = join(__dirname, '..', 'template');
        //检查项目名是否存在
        checkProjectName(dirName, true);

        if (subDirName === 'src') {
            const fromPath = join(templatePath, subDirName);
            copyFolder(fromPath, destPath, true);
        }
        else if (subDirName.startsWith('wechatMp')) {
            const fromPath = join(templatePath, 'wechatMp');
            copyFolder(fromPath, destPath, true);

            await createWechatMpBoilplate(destPath, isDev, true);
        }
        else {
            throw new global.Error(`Cannot recoganize ${success(
                `"${subDirName}"`
            )} for update.\n Please choose src/wechatMp%.`);
        }

        Success(
            `${success(
                `Successfully update directory ${primary(subDirName)} for project ${primary(dirName)}}`
            )}`
        );
    }
    catch (err) {
        console.error(error((err as Error).message));
    }

}