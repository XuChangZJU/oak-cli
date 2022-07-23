import { watchers as generalWatchers } from 'oak-general-business';
import { Watcher } from 'oak-domain/lib/types';
import { EntityDict } from 'oak-app-domain';
import { RuntimeContext } from '../RuntimeContext';

export const watchers = [...generalWatchers] as Watcher<
    EntityDict,
    keyof EntityDict,
    RuntimeContext
>[];
