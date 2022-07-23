import { CreateOperationData as Domain } from 'oak-app-domain/Domain/Schema';
import { DEV_SYSTEM_ID, DEV_DOMAIN_ID } from 'oak-general-business';

export const domains: Domain[] = [
    {
        id: DEV_DOMAIN_ID,
        protocol: 'http',
        url: 'localhost',
        port: 3001,
        apiPath: '/rest/aspect',
        systemId: DEV_SYSTEM_ID,
    },
];