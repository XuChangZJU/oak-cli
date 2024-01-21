import {
    Success,
    Error,
    error,
    primary,
    success,
    warn,
    Warn,
} from './tip-style';
import spawn from 'cross-spawn';
import { resolve } from 'path';
import makeLocale from './makeLocale';
import makeRouter from './makeRouter';
import { copyFileSync } from 'fs';

type Mode = 'development' | 'staging' | 'production';
type Target = 'mp' | 'wechatMp' | 'web' | 'rn' | 'native';

export default async function build(cmd: any) {
    const mode = (cmd.mode || 'development') as Mode;
    const target = cmd.target as Target;
    if (!cmd.target) {
        Error(
            `${error(
                `Please add --target web or --target mp(wechatMp) or --target rn(native) to run the project in Web/WechatMp/ReactNative environment`
            )}`
        );
        return;
    }
    let subdir = cmd.subDir;
    if (!subdir) {
        subdir = ['mp', 'wechatMp'].includes(target)
            ? 'wechatMp'
            : ['native', 'rn'].includes(target)
            ? 'native'
            : 'web';
    }
    // 先makeLocale
    makeLocale('', mode === 'development');
    // 再尝试makeRouter
    makeRouter({ subdir }, mode === 'development');
    //ts类型检查 waring 还是error,
    //主要web受影响，error级别的话 控制台和网页都报错，warning级别的话 控制台报错
    // development/staging/production
    const errorLevel = cmd.check !== 'error';
    Success(
        `${success(
            `build ${target} environment:${mode} ${
                ['development'].includes(mode) ? `server:${!!cmd.prod}` : ''
            } ${
                ['mp', 'wechatMp'].includes(target) &&
                ['development'].includes(mode)
                    ? `split:${!!cmd.split}`
                    : ''
            }`
        )}`
    );
    if (['mp', 'wechatMp'].includes(target)) {
        const mpFileMap = {
            production: 'build-mp.js',
            staging: 'build-staging-mp.js',
            development: 'start-mp.js',
        };
        const result = spawn.sync(
            `cross-env`,
            [
                `NODE_ENV=${mode}`,
                `NODE_TARGET=${target}`,
                `SUB_DIR_NAME=${subdir}`,
                `TSC_COMPILE_ON_ERROR=${errorLevel}`,
                `COMPILE_ANALYZE=${!!cmd.analyze}`,
                `GENERATE_SOURCEMAP=${!!cmd.sourcemap}`,
                `PROD=${!!cmd.prod}`,
                `SPLIT=${!!cmd.split}`,
                !!cmd.memoryLimit && `MEMORY_LIMIT=${cmd.memoryLimit}`,
                `node`,
                cmd.memoryLimit && `--max_old_space_size=${cmd.memoryLimit}`,
                resolve(__dirname, `../scripts/${mpFileMap[mode]}`),
            ].filter(Boolean),
            {
                stdio: 'inherit',
                shell: true,
            }
        );
        if (result.status === 0) {
            Success(`${success(`执行完成`)}`);
        } else {
            Error(`${error(`执行失败`)}`);
        }
    } else if (target === 'web') {
        const webFileMap = {
            production: 'build-web.js',
            staging: 'build-staging-web.js',
            development: 'start-web.js',
        };
        const result = spawn.sync(
            `cross-env`,
            [
                `NODE_ENV=${mode}`,
                `NODE_TARGET=${target}`,
                `SUB_DIR_NAME=${subdir}`,
                `TSC_COMPILE_ON_ERROR=${errorLevel}`,
                `COMPILE_ANALYZE=${!!cmd.analyze}`,
                `GENERATE_SOURCEMAP=${!!cmd.sourcemap}`,
                `PROD=${!!cmd.prod}`,
                !!cmd.memoryLimit && `MEMORY_LIMIT=${cmd.memoryLimit}`,
                `node`,
                cmd.memoryLimit && `--max_old_space_size=${cmd.memoryLimit}`,
                resolve(__dirname, `../scripts/${webFileMap[mode]}`),
            ].filter(Boolean),
            {
                stdio: 'inherit',
                shell: true,
            }
        );
        if (result.status === 0) {
            Success(`${success(`执行完成`)}`);
        } else {
            Error(`${error(`执行失败`)}`);
        }
    } else if (['native', 'rn'].includes(target)) {
        const prjDir = process.cwd();
        const cwd = resolve(prjDir, subdir);
        copyFileSync(
            resolve(prjDir, 'package.json'),
            resolve(cwd, 'package.json')
        );
        // rn不支持注入NODE_ENVIRONMENT这样的环境变量，cross-env没有用
        const platform = cmd.platform as 'ios' | 'android';
        let result;
        if (mode === 'production') {
            //cd native/android && cross-env NODE_ENV=production ./gradlew assembleRelease
            result = spawn.sync(
                `cd android`,
                [
                    '&& cross-env',
                    `NODE_ENV=${mode}`,
                    'OAK_PLATFORM=native',
                    './gradlew assembleRelease',
                ].filter(Boolean),
                {
                    cwd,
                    stdio: 'inherit',
                    shell: true,
                }
            );
        } else if (mode === 'staging') {
            //cd native/android && cross-env NODE_ENV=production ./gradlew assembleStaging
            result = spawn.sync(
                `cd android`,
                [
                    '&& cross-env',
                    `NODE_ENV=${mode}`,
                    'OAK_PLATFORM=native',
                    './gradlew assembleStaging',
                ].filter(Boolean),
                {
                    cwd,
                    stdio: 'inherit',
                    shell: true,
                }
            );
        } else {
            result = spawn.sync(
                `cross-env`,
                [
                    `NODE_ENV=${mode}`,
                    'OAK_PLATFORM=native',
                    `PROD=${!!cmd.prod}`,
                    'react-native',
                    'start',
                ].filter(Boolean),
                {
                    cwd,
                    stdio: 'inherit',
                    shell: true,
                }
            );
        }

        if (result.status === 0) {
            Success(`${success(`执行完成`)}`);
        } else {
            Error(`${error(`执行失败`)}`);
        }
    } else {
        Error(
            `${error(`target could only be web or mp(wechatMp) or rn(native)`)}`
        );
    }
}
