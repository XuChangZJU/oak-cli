import { Timer } from 'oak-domain/lib/types/Timer';
import { EntityDict } from '@oak-app-domain';
import { BackendRuntimeContext } from '../context/BackendRuntimeContext';

const timers: Array<Timer<EntityDict, BackendRuntimeContext>> = [
    // {
    //     name: '示例timer',
    //     cron: '30 * * * * *',
    //     fn: async (context) => {
    //         console.log(
    //             '这是示例timer程序，每30秒执行一次，请在src/timer/index中关闭'
    //         );
    //         return '示例timer完成了';
    //     },
    // },
];

export default timers;
