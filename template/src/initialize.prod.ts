import './utils/polyfill';
import { initialize as init } from 'oak-frontend-base/lib/initialize.prod';
import { SimpleConnector } from 'oak-domain/lib/utils/SimpleConnector';

import { AspectWrapper } from 'oak-domain/lib/types';
import { EntityDict, storageSchema, ActionDefDict } from 'oak-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { RuntimeContext } from './context/RuntimeContext';
import { BackendRuntimeContext } from './context/BackendRuntimeContext';
import { FrontendRuntimeContext } from './context/FrontendRuntimeContext';

import { initialize as initializeFeatures } from './features';
import { routers } from './exceptionRouters';
import { checkers } from './checkers';
import { makeException } from './types/Exception';
import { AspectDict } from './aspects/AspectDict';

import { BasicFeatures } from 'oak-frontend-base/lib/features';
import { AppType } from 'oak-app-domain/Application/Schema';

export default function initialize(
    type: AppType,
    url: string,
    i18nOptions?: Record<string, any>
) {
    let URL: string;
    /**
     * 如果是本地前后端联调，可以显示import initialize.prod走到这里
     */
    if (type === 'wechatMp') {
        // 如果是小程序，需要显式传入url
        const apiPath =
            process.env.NODE_ENV === 'development' ? '3001' : '/oak-api'; // 生产环境通过路径映射增加oak-api
        const protocol =
            process.env.NODE_ENV === 'development' ? 'http://' : 'https://';
        URL = `${protocol}${url}${apiPath}`;
    } else if (process.env.NODE_ENV === 'development') {
        URL = 'http://localhost:3001';
    } else {
        // web和public环境只需要传相对路径
        URL = `/oak-api`;
    }
    const connector = new SimpleConnector(
        URL,
        makeException,
        BackendRuntimeContext.FromSerializedString
    );
    const { i18n, features } = init<
        EntityDict,
        RuntimeContext,
        AspectDict,
        ReturnType<typeof initializeFeatures>
    >(
        storageSchema,
        (wrapper, basicFeatures) => initializeFeatures(wrapper, basicFeatures, type),
        (features) => (store) => new FrontendRuntimeContext(store, features.application, features.token),
        routers,
        connector,
        checkers,
        ActionDefDict,
        i18nOptions
    );

    return {
        i18n,
        features,
    };
}
