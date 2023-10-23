import { Watcher } from 'oak-domain/lib/types';
import { EntityDict } from '@oak-app-domain';
import { BackendRuntimeContext } from '../context/BackendRuntimeContext';

const watchers = [] as Watcher<
    EntityDict,
    keyof EntityDict,
    BackendRuntimeContext
>[];

export default watchers;
