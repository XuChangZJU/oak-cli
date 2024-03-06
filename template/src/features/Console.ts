import { EntityDict } from '@project/oak-app-domain';
import { Feature } from 'oak-frontend-base';
import { CommonAspectDict } from 'oak-common-aspect';
import { AspectDict } from '../aspects/AspectDict';
import { BackendRuntimeContext } from '@project/context/BackendRuntimeContext';
import { FrontendRuntimeContext } from '@project/context/FrontendRuntimeContext';
import { Cache } from 'oak-frontend-base/es/features/cache';

export default class Console extends Feature {
    private cache: Cache<EntityDict, BackendRuntimeContext, FrontendRuntimeContext, CommonAspectDict<EntityDict, BackendRuntimeContext>>;

    constructor(cache: Cache<EntityDict, BackendRuntimeContext, FrontendRuntimeContext, CommonAspectDict<EntityDict, BackendRuntimeContext>>) {
        super();
        this.cache = cache;
    }
}