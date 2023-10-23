import { Routine } from 'oak-domain/lib/types/Timer';
import { EntityDict } from '@oak-app-domain';
import { BackendRuntimeContext } from '../context/BackendRuntimeContext';


const startRoutines: Array<Routine<EntityDict, BackendRuntimeContext>> = [
    {
        name: '示例性routine',
        fn: async (context) => {
            console.log('示例性routine执行，请在src/routine/start.ts中关闭');
            return '示例性routine执行完成';
        },
    },
];

export default startRoutines;
