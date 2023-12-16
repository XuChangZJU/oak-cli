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

export default function initialize(
    type: AppType,
    hostname: string,
    protocolInput?: 'http:' | 'https:',
    apiPathInput?: string,
    portInput?: number
) {
    let protocol = protocolInput!,
        apiPath = apiPathInput,
        port = portInput;
    if (!protocol) {
        if (type === 'wechatMp') {
            protocol = process.env.NODE_ENV === 'development' ? 'http:' : 'https:';
        } else if (type === 'web') {
            protocol = window.location.protocol as 'http:';
        } else {
            protocol = 'http:';
        }
    }

    if (!port) {
        port = process.env.NODE_ENV === 'development' ? 3001 : undefined;   // 此处dev环境默认不经过nginx映射，与configuration/server.json中一致。prod环境与线上映射一致（默认为不设置）
    }
    if (!apiPath) {
        apiPath = process.env.NODE_ENV === 'development' ? undefined : '/oak-api';  // 此处dev环境默认不经过nginx映射（为空），prod环境设置与nginx中的路径映射对应
    }

    const connector = new SimpleConnector<EntityDict, FrontendRuntimeContext>(
        {
            protocol,
            hostname,
            port,
            apiPath,
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
