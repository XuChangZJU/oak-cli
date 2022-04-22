import { EntityDict } from 'oak-app-domain';
import { Feature } from 'oak-frontend-base';
import { AspectDict } from '../aspects';
import { Cache } from 'oak-frontend-base';

type DoSthAcion = {
    type: 'doSth',
    payload: {
        args: string;
    }
}

export class Sample extends Feature<EntityDict, AspectDict> {
    get(params: any) {
        throw new Error('Method not implemented.');
    }
    action(action: DoSthAcion) {
        throw new Error('Method not implemented.');
    }
    cache: Cache<EntityDict, AspectDict>;

    constructor(cache: Cache<EntityDict, AspectDict>) {
        super();
        this.cache = cache;
    };
};
