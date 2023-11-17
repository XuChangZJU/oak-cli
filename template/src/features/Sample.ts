import { EntityDict } from '@oak-app-domain';
import { BasicFeatures, Feature } from 'oak-frontend-base';
import { CommonAspectDict } from 'oak-common-aspect';
import { AspectDict } from '../aspects/AspectDict';
import { BackendRuntimeContext } from '@project/context/BackendRuntimeContext';
import { FrontendRuntimeContext } from '@project/context/FrontendRuntimeContext';

type DoSthAcion = {
    type: 'doSth';
    payload: {
        args: string;
    };
};

export default class Sample extends Feature {
    get(params: any) {
        throw new Error('Method not implemented.');
    }
    action(action: DoSthAcion) {
        throw new Error('Method not implemented.');
    }
    cache: BasicFeatures<
        EntityDict,
        BackendRuntimeContext,
        FrontendRuntimeContext,
        AspectDict & CommonAspectDict<EntityDict, BackendRuntimeContext>
    >['cache'];

    constructor(
        cache: BasicFeatures<
            EntityDict,
            BackendRuntimeContext,
            FrontendRuntimeContext,
            AspectDict & CommonAspectDict<EntityDict, BackendRuntimeContext>
        >['cache']
    ) {
        super();
        this.cache = cache;
    }
}
