import { EntityDict } from 'oak-app-domain';
import { BasicFeatures } from 'oak-frontend-base/lib/features';
import { CommonAspectDict } from 'oak-common-aspect';
import * as Sample from './Sample';
import { AspectDict } from '../aspects/AspectDict';
import { RuntimeContext } from '../RuntimeContext';
import { AspectWrapper } from 'oak-domain/lib/types';

export function initialize(
    aspectWrapper: AspectWrapper<
        EntityDict,
        RuntimeContext,
        AspectDict & CommonAspectDict<EntityDict, RuntimeContext>
    >,
    basicFeatures: BasicFeatures<
        EntityDict,
        RuntimeContext,
        AspectDict & CommonAspectDict<EntityDict, RuntimeContext>
    >
) {
    const { cache } = basicFeatures;

    const sample = new Sample.Sample(aspectWrapper, cache);

    return {
        sample,
    };
}

export type FeatureDict = ReturnType<typeof initialize>;
