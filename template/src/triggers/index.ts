import { triggers as generalTriggers } from 'oak-general-business';
import { Trigger } from 'oak-domain/lib/types';
import domainTriggers from 'oak-domain/lib/triggers';
import { EntityDict } from 'oak-app-domain';
import { RuntimeContext } from '../context/RuntimeContext';
import { triggers as bookTriggers } from './book';

export const triggers = [
    ...bookTriggers,
    ...generalTriggers,
    ...domainTriggers,
] as Trigger<EntityDict, keyof EntityDict, RuntimeContext>[];
