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

export default async function make(cmd: any, watch?: boolean) {
    Success(`${success(`make router`)}`);
    // node scripts/make-router.js subdir watch
    const args = [resolve(__dirname, '../scripts/make-router.js'), cmd.subdir];
    if (watch) {
        args.push('true');
        const result = spawn(
            'node',
            args,
            {
                stdio: 'inherit',
                shell: true,
            }
        );
        Success(`${success(`make router执行，监控中……`)}`);
        return;
    }
    const result = spawn.sync(
        'node',
        args,
        {
            stdio: 'inherit',
            shell: true,
        }
    );
    // const result2 = spawn.sync('npm -v', [], { stdio: 'inherit', shell: true });

    if (result.status === 0) {
        Success(`${success(`make router执行完成`)}`);
    } else {
        Error(`${error(`make router执行失败`)}`);
        process.exit(-1);
    }
}
