import { EntityDict } from '@oak-app-domain';
import { BasicFeatures } from 'oak-frontend-base';
import { GeneralFeatures, GeneralAspectDict } from 'oak-general-business';
import { CommonAspectDict } from 'oak-common-aspect/lib/AspectDict';
import { AspectDict } from '../aspects/AspectDict';
import { BackendRuntimeContext } from '../context/BackendRuntimeContext';
import { FrontendRuntimeContext } from '../context/FrontendRuntimeContext';
import { AAD, AFD } from '@project/types/RuntimeCxt';
import Sample from './Sample';
import Console from './Console';
import Menu from './Menu';

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
    const console = new Console(cache);
    const menu = new Menu(contextMenuFactory, console);

    return {
        sample,
        console,
        menu,
    };
}

export type FeatureDict = ReturnType<typeof initialize>;
