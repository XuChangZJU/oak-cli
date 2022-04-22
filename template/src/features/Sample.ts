import { EntityDict } from 'oak-app-domain';
import { Feature, BasicFeatures } from 'oak-frontend-base';
import { aspectDict } from '../aspects';
import { RuntimeContext } from '../RunningContext';

type DoSthAcion = {
    type: 'doSth',
    payload: {
        args: string;
    }
}

export class Sample extends Feature<EntityDict, RuntimeContext, typeof aspectDict> {
    get(params: any) {
        throw new Error('Method not implemented.');
    }
    action(action: DoSthAcion) {
        throw new Error('Method not implemented.');
    }
    cache: BasicFeatures<EntityDict, RuntimeContext, typeof aspectDict>['cache'];

    constructor(cache: BasicFeatures<EntityDict, RuntimeContext, typeof aspectDict>['cache']) {
        super();
        this.cache = cache;
    };
};
