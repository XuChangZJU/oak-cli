import { EntityDict } from '@oak-app-domain';
import { Checker } from 'oak-domain/lib/types';
import { RuntimeCxt } from '../types/RuntimeCxt';
import { checkAttributesNotNull } from 'oak-domain/lib/utils/validator';
import { CreateOperationData as CreateStoreData } from '@oak-app-domain/Store/Schema';

export const checkers: Checker<EntityDict, 'store', RuntimeCxt>[] = [
    {
        type: 'data',
        action: 'create',
        entity: 'store',
        checker: (data, context) => {
            if (data instanceof Array) {
                data.forEach((ele) => {
                    checkAttributesNotNull('store', data, [
                        'coordinate',
                        'name',
                        'addrDetail',
                        'areaId',
                    ]);
                });
            } else {
                checkAttributesNotNull('store', data, [
                    'coordinate',
                    'name',
                    'addrDetail',
                    'areaId',
                ]);
            }
            return 0;
        },
    },
];
