import { Timer } from 'oak-domain/lib/types/Timer';
import { EntityDict } from '@oak-app-domain';
import { BackendRuntimeContext } from '../context/BackendRuntimeContext';

const timers: Array<Timer<EntityDict, keyof EntityDict, BackendRuntimeContext>> = [
    {
        name: '示例timer',
        cron: '30 * * * * *',
        entity: 'extraFile',
        filter: {
            uploadState: 'uploading',
        },
        projection: {
            id: 1,
            uploadMeta: 1,
            uploadState: 1,
            entity: 1,
            entityId: 1,
            objectId: 1,            
        },
        fn: async (context, data) => {
            console.log(
                '这是示例timer程序，每30秒执行一次，请在src/timer/index中关闭'
            );
            return context.opResult;
        },
    },
];

export default timers;
