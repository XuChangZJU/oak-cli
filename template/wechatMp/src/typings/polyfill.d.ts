import { MakeOakComponent, MakeOakPage } from 'oak-frontend-base';
import { EntityDict } from 'oak-app-domain/EntityDict';
import { RuntimeContext, aspectDict } from 'oak-general-business';

declare global {
    const OakPage: MakeOakPage<EntityDict, RuntimeContext<EntityDict>, typeof aspectDict, {}>;
    const OakComponent: MakeOakComponent<EntityDict, RuntimeContext<EntityDict>, typeof aspectDict, {}>;
}
export {}