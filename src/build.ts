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
    Success(`${success(`build ${cmd.target} environment: ${cmd.mode}`)}`);
    const result = spawn.sync(
        `cross-env NODE_ENV=${cmd.mode} "${process.execPath}"`,
        [require.resolve('../scripts/' + 'webpack.js')],
        {
            stdio: 'inherit',
            shell: true,
        }
    );

    // const result = spawn.sync('npm -v', [], { stdio: 'inherit', shell: true });
    if (result.status === 0) {
        Success(`${success(`执行完成`)}`);
    } else {
        Error(`${error(`执行失败`)}`);
    }
}
