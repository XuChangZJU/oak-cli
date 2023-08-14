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

export default async function make() {
    Success(`${success(`make locales`)}`);
    // ts-node scripts/build-app-domain & npm link ./app-domain
    const result = spawn.sync(
        'ts-node',
        [require.resolve('../scripts/' + 'make-locale.js')],
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
        process.exit(1);
    }
}
