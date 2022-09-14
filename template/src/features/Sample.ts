import { EntityDict } from 'oak-app-domain';
import { AspectWrapper } from 'oak-domain/lib/types';
import { BasicFeatures } from 'oak-frontend-base/lib/features';
import { Feature } from 'oak-frontend-base/lib/types/Feature';
import { CommonAspectDict } from 'oak-common-aspect';
import { AspectDict } from '../aspects/AspectDict';
import { RuntimeContext } from '../context/RuntimeContext';

type DoSthAcion = {
    type: 'doSth';
    payload: {
        args: string;
    };
};

export class Sample extends Feature<
    EntityDict,
    RuntimeContext,
    AspectDict & CommonAspectDict<EntityDict, RuntimeContext>
> {
    get(params: any) {
        throw new Error('Method not implemented.');
    }
    action(action: DoSthAcion) {
        throw new Error('Method not implemented.');
    }
    cache: BasicFeatures<
        EntityDict,
        RuntimeContext,
        AspectDict & CommonAspectDict<EntityDict, RuntimeContext>
    >['cache'];

    constructor(
        aspectWrapper: AspectWrapper<EntityDict, RuntimeContext, AspectDict>,
        cache: BasicFeatures<
            EntityDict,
            RuntimeContext,
            AspectDict & CommonAspectDict<EntityDict, RuntimeContext>
        >['cache']
    ) {
        super(aspectWrapper);
        this.cache = cache;
    }
}
