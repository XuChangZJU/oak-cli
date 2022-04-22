import { EntityDict } from 'oak-app-domain';
import { BasicFeatures } from 'oak-frontend-base';
import * as Sample from './Sample';
import { aspectDict } from '../aspects';
import { RuntimeContext } from '../RunningContext';

export function initialize(features: BasicFeatures<EntityDict, RuntimeContext, typeof aspectDict>) {
    const { cache } = features;

    const sample = new Sample.Sample(cache);

    return {
        sample,
    };
}

export type FeatureDict = ReturnType<typeof initialize>;
