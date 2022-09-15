import { EntityDict } from 'oak-app-domain';
import { BasicFeatures } from 'oak-frontend-base/lib/features';
import { AppType } from 'oak-app-domain/Application/Schema';
import { initialize as initializeGeneralFeatures } from 'oak-general-business/lib/features';
import { CommonAspectDict } from 'oak-common-aspect';
import { AspectWrapper } from 'oak-domain/lib/types';
import { AspectDict } from '../aspects/AspectDict';
import { RuntimeContext } from '../context/RuntimeContext';
import * as Sample from './Sample';

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
    >,
    type: AppType,
) {
    const generalFeatures = initializeGeneralFeatures<EntityDict, RuntimeContext, AspectDict & CommonAspectDict<EntityDict, RuntimeContext>>(aspectWrapper, basicFeatures, type);
    const { cache, localStorage } = basicFeatures;

    const sample = new Sample.Sample(aspectWrapper, cache);
    return {
        sample,
        ...generalFeatures,
    };
}

export type FeatureDict = ReturnType<typeof initialize>;
