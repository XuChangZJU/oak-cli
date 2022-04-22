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

export default async function build(env: string) {
    Success(`${success(`build环境:${env}`)}`);
     const result = spawn.sync(
         `"${process.execPath}"`,
         [require.resolve('../scripts/' + 'webpack.js')].concat([env]),
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
