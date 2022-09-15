import { EntityDict } from 'oak-app-domain';
import { Checker, UpdateChecker } from 'oak-domain/lib/types';
import { RuntimeContext } from "../context/RuntimeContext";
import { checkAttributesNotNull } from 'oak-domain/lib/utils/validator';
import { CreateOperationData as CreateStoreData } from 'oak-app-domain/Store/Schema';

export const checkers: Checker<EntityDict, 'store', RuntimeContext>[] = [
    {
        type: 'data',
        action: 'create',
        entity: 'store',
        checker: async ({ operation }) => {
            const { action, data } = operation;
            const checkLegal = (data: CreateStoreData) => {
                checkAttributesNotNull(data, [
                    'coordinate',
                    'name',
                    'addrDetail',
                    'areaId',
                ]);
            };
            if (data instanceof Array) {
                data.forEach((ele) => {
                    checkLegal(ele);
                });
            } else {
                checkLegal(data);
            }
            return 0;
        },
    },
    {
        type: 'data',
        entity: 'store',
        action: ['offline', 'online', 'update'],
        checker: async (event, context) => {
            const token = await context.getToken();
            // todo checker的逻辑还未完善
            return 1;
        },
    } as UpdateChecker<EntityDict, 'store', RuntimeContext>,
];
