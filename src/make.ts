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
    Success(`${success(`build oak-app-domain`)}`);
    // ts-node scripts/build-app-domain & npm link ./app-domain
    const result = spawn.sync(
        'ts-node',
        [require.resolve('../scripts/' + 'build-app-domain.js')],
        {
            stdio: 'inherit',
            shell: true,
        }
    );
    // const result2 = spawn.sync('npm -v', [], { stdio: 'inherit', shell: true });

    if (result.status === 0) {
        Success(`${success(`build 执行完成`)}`);
    } else {
        Error(`${error(`build 执行失败`)}`);
        process.exit(1);
    }

    Success(`${success(`npm link oak-app-domain`)}`);

    const isMac = process.platform === 'darwin';
    const result2 = spawn.sync(
        `${isMac ? 'sudo' : ''} npm`,
        [`link ${process.cwd()}/oak-app-domain`],
        {
            stdio: 'inherit',
            shell: true,
        }
    );

    if (result2.status === 0) {
        Success(`${success(`link 执行完成`)}`);
    } else {
        Error(`${error(`link 执行失败`)}`);
        process.exit(1);
    }
}
