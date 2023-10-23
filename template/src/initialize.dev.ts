import { initialize as init } from 'oak-general-business/es/initialize.dev';
import { GFD, GAD } from 'oak-general-business';

import { EntityDict, storageSchema, ActionDefDict } from '@oak-app-domain';
import { BackendRuntimeContext } from './context/BackendRuntimeContext';
import { FrontendRuntimeContext } from './context/FrontendRuntimeContext';

import { initialize as initializeFeatures, FeatureDict } from './features';

// dev需要将下面内容也传入
import { AspectDict } from './aspects/AspectDict';
import aspectDict from './aspects';
import triggers from './triggers';
import watchers from './watchers';
import data from './data';
import checkers from './checkers';
import timers from './timers';
import { importations, exportations } from './ports';
import startRoutines from './routines/start';
import colorDict from './config/color';
import cacheSavedEntities from './config/cache';
import {
    selectFreeEntities,
    updateFreeDict,
    authDeduceRelationMap,
} from './config/relation';

import { AppType } from '@oak-app-domain/Application/Schema';

export default function initialize(type: AppType, hostname: string) {
    const wholeFeatures = {} as GFD<
        EntityDict,
        BackendRuntimeContext,
        FrontendRuntimeContext,
        AspectDict & GAD<EntityDict, BackendRuntimeContext>
    > &
        FeatureDict;
    const { features } = init<
        EntityDict,
        BackendRuntimeContext,
        AspectDict,
        FrontendRuntimeContext
    >(
        type,
        hostname,
        storageSchema,
        () => (store) => new FrontendRuntimeContext(store, wholeFeatures),
        (str) => BackendRuntimeContext.FromSerializedString(str),
        aspectDict,
        triggers,
        checkers,
        watchers,
        timers,
        startRoutines,
        data as any,
        {
            actionDict: ActionDefDict,
            colorDict,
            importations,
            exportations,
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
