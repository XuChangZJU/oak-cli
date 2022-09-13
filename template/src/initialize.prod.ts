import './utils/polyfill';
import { initialize as init } from 'oak-frontend-base/lib/initialize.prod';
import { SimpleConnector } from 'oak-domain/lib/utils/SimpleConnector';

import { AspectWrapper } from 'oak-domain/lib/types';
import { EntityDict, storageSchema, ActionDefDict } from 'oak-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { RuntimeContext } from './RuntimeContext';

import { initialize as initializeGeneralFeatures } from 'oak-general-business/lib/features';

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
    let wholeFeatures = {};
    const createFeatures = (
        aspectWrapper: AspectWrapper<
            EntityDict,
            RuntimeContext,
            AspectDict & CommonAspectDict<EntityDict, RuntimeContext>
        >,
        basicFeatures: BasicFeatures<
            EntityDict,
            RuntimeContext,
            AspectDict & CommonAspectDict<EntityDict, RuntimeContext>
        >,
        context: RuntimeContext
    ) => {
        const generalFeatures = initializeGeneralFeatures<
            EntityDict,
            RuntimeContext,
            AspectDict
        >(aspectWrapper, basicFeatures, type, context);

        const features = initializeFeatures(
            aspectWrapper,
            basicFeatures,
            generalFeatures
        );
        const features2 = Object.assign(
            generalFeatures,
            features
        );

        Object.assign(wholeFeatures, features2, basicFeatures);
        return features2;
    };

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
        URL = `${protocol}${url}${apiPath}/aspect`;
    } else if (process.env.NODE_ENV === 'development') {
        URL = 'http://localhost:3001/aspect';
    } else {
        // web和public环境只需要传相对路径
        URL = `/oak-api/aspect`;
    }
    const connector = new SimpleConnector(
        URL,
        makeException,
        RuntimeContext.FromCxtStr
    );
    const { i18n } = init<
        EntityDict,
        RuntimeContext,
        AspectDict,
        ReturnType<typeof createFeatures>
    >(
        storageSchema,
        createFeatures,
        RuntimeContext.FromCxtStr,
        routers,
        connector,
        checkers,
        ActionDefDict,
        i18nOptions
    );

    return {
        i18n,
        features: wholeFeatures as BasicFeatures<
            EntityDict,
            RuntimeContext,
            AspectDict & CommonAspectDict<EntityDict, RuntimeContext>
        > &
            ReturnType<typeof createFeatures>,
    };
}
