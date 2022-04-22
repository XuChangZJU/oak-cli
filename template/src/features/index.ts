import { EntityDict } from 'oak-app-domain';
import { BasicFeatures } from 'oak-frontend-base';
import { RuntimeContext } from 'oak-general-business'
import * as Sample from './Sample';
import { AspectDict } from '../aspects';

export function initialize(features: BasicFeatures<EntityDict, RuntimeContext<EntityDict>, AspectDict>) {
    const { cache } = features;

    const sample = new Sample.Sample(cache);

    return {
        sample,
    };
}

export type FeatureDict = ReturnType<typeof initialize>;
