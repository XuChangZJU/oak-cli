import { EntityDict } from 'oak-app-domain';
import { Checker } from 'oak-domain/lib/types';
import { processCheckers } from 'oak-general-business/lib/utils/check';
import { checkers as generalCheckers } from 'oak-general-business';
import { RuntimeContext } from '../RuntimeContext';
import { checkers as bookCheckers } from './book';
import { checkers as storeCheckers } from './store';

const checkers = [
    ...storeCheckers,
    ...bookCheckers,
    ...generalCheckers,
] as Checker<EntityDict, keyof EntityDict, RuntimeContext>[];
processCheckers(checkers);
export { checkers };
