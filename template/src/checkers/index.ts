import { EntityDict } from 'oak-app-domain';
import { Checker } from 'oak-domain/lib/types';
import { processCheckers } from 'oak-general-business/src/utils/check';
import { checkers as generalCheckers } from 'oak-general-business';
import { RuntimeContext } from '../RuntimeContext';
import { checkers as houseCheckers } from './house';

const checkers = [...houseCheckers, ...generalCheckers] as Checker<
    EntityDict,
    keyof EntityDict,
    RuntimeContext
>[];
processCheckers(checkers);
export { checkers };
