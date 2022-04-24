import { EntityDict } from 'oak-app-domain';
import { Checker } from 'oak-domain/lib/types';
import { checkers as GeneralCheckers } from 'oak-general-business';
import { RuntimeContext } from '../RuntimeContext';
import { checkers as houseCheckers } from './house';

export const checkers = [...houseCheckers, ...GeneralCheckers] as Checker<EntityDict, keyof EntityDict, RuntimeContext>[];