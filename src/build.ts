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
            `${error(`Please add --target web or --target mp to he command`)}`
        );
        return;
    }
    Success(`${success(`build ${cmd.target} environment: ${cmd.mode}`)}`);
    if (cmd.target === 'mp') {
        const result = spawn.sync(
            `cross-env NODE_ENV=${cmd.mode} NODE_TARGET=${cmd.target} "${process.execPath}"`,
            [require.resolve('../scripts/build-mp.js')],
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
            `cross-env NODE_ENV=${cmd.mode} NODE_TARGET=${cmd.target} "${process.execPath}"`,
            [
                require.resolve(
                    `../scripts/${
                        cmd.mode === 'production'
                            ? 'build-web.js'
                            : 'start-web.js'
                    }`
                ),
            ],
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
