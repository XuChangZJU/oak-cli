import './utils/polyfill';
import { BasicFeatures, InitializeWechatMp, } from 'oak-frontend-base';
import { EntityDict } from 'oak-app-domain';
import { storageSchema, ActionDefDict } from 'oak-app-domain';
import { aspectDict } from '../../src/aspects';
import { initialize } from '../../src/features';
import { checkers } from '../../src/checkers';
import { triggers } from '../../src/triggers';
import { data } from '../../src/data';
import { routers } from '../../src/exceptionRouters';


import { initializeFeatures as initializeGeneralFeatures } from 'oak-general-business';
import { RuntimeContext } from '../../src/RuntimeContext';

const { token } = initializeGeneralFeatures<EntityDict, RuntimeContext, typeof aspectDict>();

export const createFeatures = (basicFeatures: BasicFeatures<EntityDict, RuntimeContext, typeof aspectDict>) => {
    const features = initialize(basicFeatures);
    const wholeFeatures = Object.assign({
        token,
    }, features);
    return wholeFeatures;
}

const { OakComponent, OakPage, features } = InitializeWechatMp<EntityDict, RuntimeContext, typeof aspectDict, ReturnType<typeof createFeatures>>(
    storageSchema,
    createFeatures,
    (store) => new RuntimeContext(store, data.application[0].id, token.getToken()),
    routers,
    triggers,
    checkers,
    aspectDict,
    data as any,
    ActionDefDict);

Object.assign(global, {
    OakPage,
    OakComponent,
});

export {
    features,
};