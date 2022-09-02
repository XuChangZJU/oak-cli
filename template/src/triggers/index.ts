import { triggers as generalTriggers } from 'oak-general-business';
import { triggers as houseTriggers } from './house';
import { Trigger } from 'oak-domain/lib/types';
import domainTriggers from 'oak-domain/lib/triggers';
import { EntityDict } from 'oak-app-domain';
import { RuntimeContext } from '../RuntimeContext';

export const triggers = [
    ...houseTriggers,
    ...generalTriggers,
    ...domainTriggers,
] as Trigger<EntityDict, keyof EntityDict, RuntimeContext>[];
