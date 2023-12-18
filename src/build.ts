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
import { copyFileSync } from 'fs';

export default async function build(cmd: any) {
    if (!cmd.target) {
        Error(
            `${error(
                `Please add --target web or --target mp(wechatMp) or --target rn(native) to run the project in Web/WechatMp/ReactNative environment`
            )}`
        );
        return;
    }
    // 先makeLocale
    makeLocale('', true);
    //ts类型检查 waring 还是error,
    //主要web受影响，error级别的话 控制台和网页都报错，warning级别的话 控制台报错
    // development/staging/production
    const TSC_COMPILE_ON_ERROR = cmd.check !== 'error';
    Success(
        `${success(
            `build ${cmd.target} environment:${cmd.mode} ${
                ['development'].includes(cmd.mode) ? `server:${!!cmd.prod}` : ''
            } ${
                ['mp', 'wechatMp'].includes(cmd.target) &&
                ['development'].includes(cmd.mode)
                    ? `split:${!!cmd.split}`
                    : ''
            }`
        )}`
    );
    if (['mp', 'wechatMp'].includes(cmd.target)) {
        const result = spawn.sync(
            `cross-env`,
            [
                `NODE_ENV=${cmd.mode}`,
                `NODE_TARGET=${cmd.target}`,
                `SUB_DIR_NAME=${cmd.subDir || 'wechatMp'}`,
                `TSC_COMPILE_ON_ERROR=${TSC_COMPILE_ON_ERROR}`,
                `COMPILE_ANALYZE=${!!cmd.analyze}`,
                `GENERATE_SOURCEMAP=${!!cmd.sourcemap}`,
                `PROD=${!!cmd.prod}`,
                `SPLIT=${!!cmd.split}`,
                !!cmd.memoryLimit && `MEMORY_LIMIT=${cmd.memoryLimit}`,
                `node`,
                cmd.memoryLimit && `--max_old_space_size=${cmd.memoryLimit}`,
                require.resolve(
                    `../scripts/${
                        cmd.mode === 'production'
                            ? 'build-mp.js'
                            : 'start-mp.js'
                    }`
                ),
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
    } else if (cmd.target === 'web') {
        const result = spawn.sync(
            `cross-env`,
            [
                `NODE_ENV=${cmd.mode}`,
                `NODE_TARGET=${cmd.target}`,
                `SUB_DIR_NAME=${cmd.subDir || 'web'}`,
                `TSC_COMPILE_ON_ERROR=${TSC_COMPILE_ON_ERROR}`,
                `COMPILE_ANALYZE=${!!cmd.analyze}`,
                `GENERATE_SOURCEMAP=${!!cmd.sourcemap}`,
                `PROD=${!!cmd.prod}`,
                !!cmd.memoryLimit && `MEMORY_LIMIT=${cmd.memoryLimit}`,
                `node`,
                cmd.memoryLimit && `--max_old_space_size=${cmd.memoryLimit}`,
                resolve(
                    `../scripts/${
                        cmd.mode === 'production'
                            ? 'build-web.js'
                            : 'start-web.js'
                    }`
                ),
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
    } else if (['native', 'rn'].includes(cmd.target)) {
        const prjDir = process.cwd();
        const cwd = resolve(prjDir, cmd.subDir || 'native');
        copyFileSync(
            resolve(prjDir, 'package.json'),
            resolve(cwd, 'package.json')
        );
        // rn不支持注入NODE_ENVIRONMENT这样的环境变量，cross-env没有用
        /* const result = spawn.sync(
            'react-native',
            [
                'start',
            ],
            {
                cwd,
                stdio: 'inherit',
                shell: true,
            }
        ); */
        const result = spawn.sync(
            `cross-env`,
            [
                `NODE_ENV=${cmd.mode}`,
                'OAK_PLATFORM=native',
                'react-native',
                'start',
            ].filter(Boolean),
            {
                cwd,
                stdio: 'inherit',
                shell: true,
            }
        );
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
