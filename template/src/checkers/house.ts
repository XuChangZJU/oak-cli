import { EntityDict } from 'oak-app-domain';
import { Checker, UpdateChecker } from "oak-domain/lib/types";
import { RuntimeContext } from '../RuntimeContext';

export const checkers: Checker<EntityDict, 'house', RuntimeContext>[] = [
    {
        entity: 'house',
        action: ['offline', 'online', 'update'],
        checker: async (event, context) => {
            const token = await context.getToken();            
            // todo checker的逻辑还未完善
            return 1;
        }
    } as UpdateChecker<EntityDict, 'house', RuntimeContext>,
];