import { EntityDict } from 'oak-app-domain';
import { Checker, UpdateChecker } from 'oak-domain/lib/types';
import { RuntimeContext } from '../RuntimeContext';
import { checkAttributesNotNull } from 'oak-domain/lib/utils/validator';
import { CreateOperationData as CreateBookData } from 'oak-app-domain/Book/Schema';

export const checkers: Checker<EntityDict, 'book', RuntimeContext>[] = [
    {
        type: 'data',
        action: 'create',
        entity: 'book',
        checker: async ({ operation }) => {
            const { action, data } = operation;
            const checkLegal = (data: CreateBookData) => {
                checkAttributesNotNull(data, [
                    'number',
                    'name',
                    'author',
                    'introduction',
                    'price',
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
        entity: 'book',
        action: ['offline', 'online', 'update'],
        checker: async (event, context) => {
            const token = await context.getToken();
            // todo checker的逻辑还未完善
            return 1;
        },
    } as UpdateChecker<EntityDict, 'book', RuntimeContext>,
];
