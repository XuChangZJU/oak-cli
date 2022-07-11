import {
    Success,
    error,
    primary,
    success,
    warn,
    Warn,
} from './tip-style';
import spawn from 'cross-spawn';

export default async function run(options: any): Promise<void> {    
    if (options.initialize) {
        Success(`${success('初始化数据库中……')}`);
        // ts-node scripts/build-app-domain & npm link ./app-domain
        const drop = options.args.includes('drop') || false;
        const result = spawn.sync(
            'ts-node',
            [require.resolve('../scripts/' + 'initialize-database.js'), `${drop}`],
            {
                stdio: 'inherit',
                shell: true,
            }
        );
    
        if (result.status === 0) {
            Success(`${success(`初始化数据库完成`)}`);
        } else {
            Error(`${error(`初始化数据库失败`)}`);
            process.exit(1);
        }
    }
    else {
        Success(`${success('启动服务器……')}`);
        console.log(options.mode);
        // ts-node scripts/build-app-domain & npm link ./app-domain
        const result =  spawn.sync(
            `cross-env`,
            [
                `NODE_ENV=${options.mode}`,
                'ts-node',
                require.resolve('../scripts/' + 'start-server.js'),
            ],
            {
                stdio: 'inherit',
                shell: true,
            }
        );
    }
}