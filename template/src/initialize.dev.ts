import './utils/polyfill';
import { initialize as init } from 'oak-frontend-base/lib/initialize.dev';

import { EntityDict, storageSchema, ActionDefDict } from 'oak-app-domain';
import { CommonAspectDict } from 'oak-common-aspect';
import { RuntimeContext } from './RuntimeContext';

import { initialize as initializeGeneralFeatures } from 'oak-general-business/src/features';

import { initialize as initializeFeatures } from './features';
import { data } from './data';
import { routers } from './exceptionRouters';
import { checkers } from './checkers';

// dev需要将下面内容也传入
import { AspectDict } from './aspects/AspectDict';
import { aspectDict } from './aspects';
import { triggers } from './triggers';
import { watchers } from './watchers';

import { AspectWrapper } from 'oak-domain/lib/types';
import { BasicFeatures } from 'oak-frontend-base/lib/features';
import { AppType } from 'oak-app-domain/Application/Schema';

export default function initialize(type: AppType, url?: string) {
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
        const { token, extraFile, application } = initializeGeneralFeatures<
            EntityDict,
            RuntimeContext,
            AspectDict
        >(aspectWrapper, basicFeatures, type, context);

        const features = initializeFeatures(aspectWrapper, basicFeatures);
        const features2 = Object.assign(
            {
                token,
                extraFile,
                application,
            },
            features
        );

        Object.assign(wholeFeatures, features2, basicFeatures);
        return features2;
    };

    const { i18n } = init<
        EntityDict,
        RuntimeContext,
        AspectDict,
        ReturnType<typeof createFeatures>
    >(
        storageSchema,
        createFeatures,
        RuntimeContext.FromCxtStr,
        aspectDict,
        routers,
        triggers,
        checkers,
        watchers,
        data as any,
        ActionDefDict
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
