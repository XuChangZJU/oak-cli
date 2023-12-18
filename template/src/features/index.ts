import { EntityDict } from '@oak-app-domain';
import { BasicFeatures } from 'oak-frontend-base';
import { GeneralFeatures, GeneralAspectDict } from 'oak-general-business';
import { CommonAspectDict } from 'oak-common-aspect/lib/AspectDict';
import { AspectDict } from '../aspects/AspectDict';
import { BackendRuntimeContext } from '../context/BackendRuntimeContext';
import { FrontendRuntimeContext } from '../context/FrontendRuntimeContext';
import { AAD, AFD } from '@project/types/RuntimeCxt';
import Sample from './Sample';

export function initialize(
    generalFeatures: BasicFeatures<
        EntityDict,
        BackendRuntimeContext,
        FrontendRuntimeContext,
        AspectDict &
            CommonAspectDict<EntityDict, BackendRuntimeContext> &
            GeneralAspectDict<EntityDict, BackendRuntimeContext>
    > &
        GeneralFeatures<
            EntityDict,
            BackendRuntimeContext,
            FrontendRuntimeContext,
            AspectDict &
                CommonAspectDict<EntityDict, BackendRuntimeContext> &
                GeneralAspectDict<EntityDict, BackendRuntimeContext>
        >
) {
    const {
        cache,
        localStorage,
        location,
        token,
        application,
        contextMenuFactory,
    } = generalFeatures;

    const sample = new Sample(cache);

    return {
        sample,
    };
}

export type FeatureDict = ReturnType<typeof initialize>;
