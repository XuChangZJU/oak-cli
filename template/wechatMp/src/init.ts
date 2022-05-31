import "./utils/polyfill";
import { InitializeWechatMp } from 'oak-frontend-base';
import { EntityDict } from 'oak-app-domain';
import { storageSchema, ActionDefDict } from 'oak-app-domain';
import { RuntimeContext } from '../../src/RuntimeContext';
import { aspectDict, createFeatures, routers, triggers, checkers, data, token, application } from '../../src/initialize';

// 每个应用都要初始化applicationId（generalbusiness的要求）
const applicationId = data.application[0].id;
const { OakComponent, OakPage, features } = InitializeWechatMp<EntityDict, RuntimeContext, typeof aspectDict, ReturnType<typeof createFeatures>>(
    storageSchema,
    createFeatures,
    (store, scene) => new RuntimeContext(store, applicationId, () => token.getToken(), scene),
    routers,
    triggers,
    checkers,
    aspectDict,
    data as any,
    ActionDefDict);

// 因为依赖的问题，general库中的部分feature暂时只能在这里注入。以后再修改
token.setCache(features.cache);
application.setCache(features.cache);
application.setApplicationId(applicationId);


Object.assign(global, {
    OakPage,
    OakComponent,
});

export {
    features,
    createFeatures,
};