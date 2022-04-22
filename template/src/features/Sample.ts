import { EntityDict } from 'oak-app-domain';
import { Feature, BasicFeatures } from 'oak-frontend-base';
import { RuntimeContext } from 'oak-general-business';
import { AspectDict } from '../aspects';

type DoSthAcion = {
    type: 'doSth',
    payload: {
        args: string;
    }
}

export class Sample extends Feature<EntityDict, RuntimeContext<EntityDict>, AspectDict> {
    get(params: any) {
        throw new Error('Method not implemented.');
    }
    action(action: DoSthAcion) {
        throw new Error('Method not implemented.');
    }
    cache: BasicFeatures<EntityDict, RuntimeContext<EntityDict>, AspectDict>['cache'];

    constructor(cache: BasicFeatures<EntityDict, RuntimeContext<EntityDict>, AspectDict>['cache']) {
        super();
        this.cache = cache;
    };
};
