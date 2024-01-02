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
    Success(`${success(`make locales`)}`);
    // ts-node scripts/build-app-domain & npm link ./app-domain
    const args = [resolve(__dirname, '../scripts/' + 'make-locale.js')];
    if (watch) {
        args.push('true');
    }
    if (!watch) {
        const result = spawn.sync(
            'ts-node',
            args,
            {
                stdio: 'inherit',
                shell: true,
            }
        );
        // const result2 = spawn.sync('npm -v', [], { stdio: 'inherit', shell: true });
    
        if (result.status === 0) {
            Success(`${success(`make 执行完成`)}`);
        } else {
            Error(`${error(`make 执行失败`)}`);
            process.exit(-1);
        }
    }
    else {
        spawn(
            'ts-node',
            args,
            {
                stdio: 'inherit',
                shell: true,
            }
        );
    }
}
