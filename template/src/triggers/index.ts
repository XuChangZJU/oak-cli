import { triggers as houseTriggers } from './house';
import { triggers as GenenralTriggers } from 'oak-general-business';
import { Trigger } from 'oak-domain/lib/types';
import { EntityDict } from 'oak-app-domain';
import { RuntimeContext } from '../RuntimeContext';

export const triggers = [...houseTriggers, ...GenenralTriggers] as Trigger<EntityDict, keyof EntityDict, RuntimeContext>[];
