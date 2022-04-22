import { Aspect } from 'oak-domain/lib/types';
import { aspectDict as GeneralAspectDict } from 'oak-general-business';
import { EntityDict } from 'oak-app-domain';
import { RuntimeContext } from '../RunningContext';

import { test } from './sample';

const aspectDict = Object.assign({
    test
}, GeneralAspectDict) as Record<string, Aspect<EntityDict, RuntimeContext>>;


export {
    aspectDict,
}