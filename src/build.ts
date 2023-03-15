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

export default async function build(cmd: any) {
    if (!cmd.target) {
        Error(
            `${error(
                `Please add --target web or --target mp or --target wechatMp to he command`
            )}`
        );
        return;
    }
    //ts类型检查 waring 还是error,
    //主要web受影响，error级别的话 控制台和网页都报错，warning级别的话 控制台报错
    const TSC_COMPILE_ON_ERROR = cmd.check !== 'error';
    Success(`${success(`build ${cmd.target} environment:${cmd.mode} prod:${!!cmd.prod} split:${!!cmd.split}`)}`);
    if (cmd.target === 'mp' || cmd.target === 'wechatMp') {
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
                `node`,
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
                `node`,
                require.resolve(
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
    }
}
