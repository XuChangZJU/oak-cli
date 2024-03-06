import { initialize as init } from 'oak-general-business/es/initialize.prod';

import { SimpleConnector } from 'oak-domain/lib/utils/SimpleConnector';
import {
    EntityDict,
    storageSchema,
    ActionDefDict,
} from '@oak-app-domain';
import { BackendRuntimeContext } from './context/BackendRuntimeContext';
import { FrontendRuntimeContext } from './context/FrontendRuntimeContext';

import { initialize as initializeFeatures } from './features';
import checkers from './checkers';
import { makeException } from './types/Exception';
import { AspectDict } from './aspects/AspectDict';
import colorDict from './config/color';
import cacheSavedEntities from './config/cache';
import { selectFreeEntities, updateFreeDict, authDeduceRelationMap } from './config/relation';

import { AppType } from '@oak-app-domain/Application/Schema';
import { AFD } from '@project/types/RuntimeCxt';

const NGINX_PROXY_PATH = '/oak-api';    // nginx反射代理到系统的映射

export default function initialize(
    type: AppType,
    hostname: string,
    protocol?: 'http:' | 'https:',
    apiPath?: string,
    port?: number
) {
    const connector = new SimpleConnector<EntityDict, FrontendRuntimeContext>(
        {
            protocol: protocol || 'http:',
            hostname,
            port,
            apiPath: typeof apiPath === 'string' ? apiPath : NGINX_PROXY_PATH,
        },
        makeException
    );
    const wholeFeatures = {} as AFD;
    const { features } = init<
        EntityDict,
        BackendRuntimeContext,
        AspectDict,
        FrontendRuntimeContext
    >(
        type,
        hostname,
        storageSchema,
        () => (store) =>
            new FrontendRuntimeContext(
                store,
                wholeFeatures
            ),
        connector,
        checkers,
        {
            actionDict: ActionDefDict,
            colorDict,
            authDeduceRelationMap,
            selectFreeEntities,
            updateFreeDict,
            cacheSavedEntities,
        }
    );

    const appFeatures = initializeFeatures(features);

    Object.assign(wholeFeatures, appFeatures, features);
    return {
        features: wholeFeatures,
    };
}
