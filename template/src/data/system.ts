import { CreateOperationData as System } from 'oak-app-domain/System/Schema';
import { DEV_SYSTEM_ID } from 'oak-general-business';

import Config from '../config';

export const systems: System[] = [
    {
        id: DEV_SYSTEM_ID,
        name: Config.System.develop.name,
        description: Config.System.develop.description,
        config: Config.System.develop.config,
    },
];
