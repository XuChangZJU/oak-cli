import { EntityDict } from 'oak-app-domain';
import { BasicFeatures } from 'oak-frontend-base';
import * as Sample from './Sample';
import { aspectDict } from '../aspects';
import { RuntimeContext } from '../RuntimeContext';
import { GeneralRuntimeContext } from 'oak-general-business';

export function initialize(basicFeatures: BasicFeatures<EntityDict, RuntimeContext, typeof aspectDict>) {
    const { cache } = basicFeatures;

    const sample = new Sample.Sample(cache);

    return {
        sample,
    };
}

export type FeatureDict = ReturnType<typeof initialize>;
