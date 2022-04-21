import { InitializeWechatMp, } from 'oak-frontend-base';
import { EntityDict } from 'oak-app-domain/EntityDict';
import { storageSchema } from 'oak-app-domain/Storage';


import { triggers, aspectDict, data, checkers, RuntimeContext } from 'oak-general-business';

const { OakComponent, OakPage } = InitializeWechatMp<EntityDict, RuntimeContext<EntityDict>, typeof aspectDict, {}>(
    storageSchema,
    () => ({}),
    (store) => new RuntimeContext(store, '123'),
    triggers as any,
    checkers as any,
    aspectDict,
    data as any);
export {
    OakPage,
    OakComponent,
};