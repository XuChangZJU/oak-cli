import { InitializeWechatMp, } from 'oak-frontend-base';
import { EntityDict } from 'oak-app-domain';
import { storageSchema } from 'oak-app-domain/Storage';
import { aspectDict } from '../../src/aspects';
import { initialize } from '../../src/features';
import { checkers } from '../../src/checkers';
import { triggers } from '../../src/triggers';
import { data } from '../../src/data';


import { initializeFeatures as initializeGeneralFeatures } from 'oak-general-business';
import { RuntimeContext } from '../../src/RuntimeContext';

const { token } = initializeGeneralFeatures();

const { OakComponent, OakPage } = InitializeWechatMp<EntityDict, RuntimeContext, typeof aspectDict, {}>(
    storageSchema,
    (basicFeatures) => {
        const features = initialize(basicFeatures);
        return Object.assign({
            token,
        }, features);
    },
    (store) => new RuntimeContext(store, data.application[0].id, token.getToken()),
    triggers,
    checkers,
    aspectDict,
    data as any);

Object.assign(global, {
    OakPage,
    OakComponent,
});