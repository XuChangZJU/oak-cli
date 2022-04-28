import { MakeOakComponent, MakeOakPage } from 'oak-frontend-base';
import { EntityDict } from 'oak-app-domain/EntityDict';
import { RuntimeContext } from '../../../src/RuntimeContext';
import { aspectDict } from '../../../src/aspects';
import { createFeatures } from '../init';

declare global {
    const OakPage: MakeOakPage<EntityDict, RuntimeContext, typeof aspectDict,  ReturnType<typeof createFeatures>>;
    const OakComponent: MakeOakComponent<EntityDict, RuntimeContext, typeof aspectDict,  ReturnType<typeof createFeatures>>;
}
export {}