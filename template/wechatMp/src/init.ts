import './utils/polyfill';
import { InitializeWechatMp } from 'oak-frontend-base';
import { EntityDict } from 'oak-app-domain';
import { storageSchema, ActionDefDict } from 'oak-app-domain';
import { RuntimeContext } from '../../src/RuntimeContext';
import {
    aspectDict,
    createFeatures,
    routers,
    triggers,
    checkers,
    data,
    token,
} from '../../src/initialize';

const { OakComponent, OakPage, features } = InitializeWechatMp<
    EntityDict,
    RuntimeContext,
    typeof aspectDict,
    ReturnType<typeof createFeatures>
>(
    storageSchema,
    createFeatures,
    (store, scene) =>
        new RuntimeContext(
            store,
            data.application[0].id,
            () => token.getToken(),
            scene
        ),
    routers,
    triggers,
    checkers,
    aspectDict,
    data as any,
    ActionDefDict
);

// 因为依赖的问题，token中的Cache暂时只能在这里注入。以后再修改
token.setCache(features.cache);

Object.assign(global, {
    OakPage,
    OakComponent,
});

export { features };
