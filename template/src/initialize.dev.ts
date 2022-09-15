import './utils/polyfill';
import { initialize as init } from 'oak-frontend-base/lib/initialize.dev';

import { EntityDict, storageSchema, ActionDefDict } from './oak-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { RuntimeContext } from './context/RuntimeContext';
import { BackendRuntimeContext } from './context/BackendRuntimeContext';
import { FrontendRuntimeContext } from './context/FrontendRuntimeContext';

import { initialize as initializeFeatures } from './features';
import { data } from './data';
import { routers } from './exceptionRouters';
import { checkers } from './checkers';

// dev需要将下面内容也传入
import { AspectDict } from './aspects/AspectDict';
import { aspectDict } from './aspects';
import { triggers } from './triggers';
import { watchers } from './watchers';

import { BasicFeatures } from 'oak-frontend-base/lib/features';
import { AppType } from 'oak-app-domain/Application/Schema';

export default function initialize(
    type: AppType,
    url?: string,
    i18nOptions?: Record<string, any>
) {
    const { i18n, features } = init<
        EntityDict,
        RuntimeContext,
        AspectDict,
        ReturnType<typeof initializeFeatures>
    >(
        storageSchema,
        (wrapper, basicFeatures) => initializeFeatures(wrapper, basicFeatures, type),
        (features) => (store) => new FrontendRuntimeContext(store, features.application, features.token),
        (str) => BackendRuntimeContext.FromSerializedString(str),
        aspectDict,
        routers,
        triggers,
        checkers,
        watchers,
        data as any,
        ActionDefDict,
        i18nOptions
    );

    return {
        i18n,
        features,
    };
}
