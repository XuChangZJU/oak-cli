import { MakeOakComponent, MakeOakPage } from 'oak-frontend-base/src/page.mp';
import { EntityDict } from 'oak-app-domain';
import { RuntimeContext } from '../../../src/RuntimeContext';
import { aspectDict } from '../../../src/aspects';
import { initialize } from '../../../src/initialize';

declare global {
    const OakPage: MakeOakPage<
        EntityDict,
        RuntimeContext,
        typeof aspectDict,
        ReturnType<typeof initialize>['features']
    >;
    const OakComponent: MakeOakComponent<
        EntityDict,
        RuntimeContext,
        typeof aspectDict,
        ReturnType<typeof initialize>['features']
    >;
}
export {};
