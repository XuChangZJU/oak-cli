import { CreateOperationData as System } from 'oak-app-domain/System/Schema';
export const DEV_SYSTEM_ID = 'MY_DEV_SYSTEM_ID';

export const systems: System[] = [
    {
        id: DEV_SYSTEM_ID,
        name: 'develop',
        description: '开发用的system',
        config: {},
    }
];