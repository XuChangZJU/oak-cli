import './utils/polyfill';
import { initializeFeatures as initializeGeneralFeatures } from 'oak-general-business';
import { BasicFeatures, } from 'oak-frontend-base';
import { EntityDict } from 'oak-app-domain';
import { RuntimeContext } from './RuntimeContext';
import { aspectDict } from './aspects';
import { initialize } from './features';
import { checkers } from './checkers';
import { triggers } from './triggers';
import { data } from './data';
import { routers } from './exceptionRouters';

const { token, extraFile, application } = initializeGeneralFeatures<EntityDict, RuntimeContext, typeof aspectDict>();

const createFeatures = (basicFeatures: BasicFeatures<EntityDict, RuntimeContext, typeof aspectDict>) => {
    const features = initialize(basicFeatures);
    const wholeFeatures = Object.assign(
        {
            token,
            extraFile,
            application,
        },
        features
    );
    return wholeFeatures;
};

export {
    createFeatures,
    aspectDict,
    triggers,
    checkers,
    data,
    routers,

    token,
    application,
}
