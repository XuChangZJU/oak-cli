import { Routine } from 'oak-domain/lib/types/Timer';
import { EntityDict } from '@oak-app-domain';
import { BackendRuntimeContext } from '../context/BackendRuntimeContext';


const startRoutines: Array<Routine<EntityDict, keyof EntityDict, BackendRuntimeContext>> = [
    {
        name: '示例性routine',
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
            console.log('示例性routine执行，请在src/routine/start.ts中关闭');
            return context.opResult;
        },
    },
];

export default startRoutines;
