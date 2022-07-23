import { test } from './sample';
import { aspectDict as generalAspectDict } from 'oak-general-business';
import { AspectDict as GeneralAspectDict } from 'oak-general-business/src/aspects/AspectDict';
import { AspectDict } from './AspectDict';
import { EntityDict } from 'oak-app-domain';
import { RuntimeContext } from '../RuntimeContext';

const aspectDict = {
    test,
    ...generalAspectDict,
} as AspectDict & GeneralAspectDict<EntityDict, RuntimeContext>;

export { aspectDict };
