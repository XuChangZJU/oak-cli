import { GeneralRuntimeContext } from 'oak-general-business';
import { EntityDict } from 'oak-app-domain';
import { RowStore } from 'oak-domain/lib/types';

export class RuntimeContext extends GeneralRuntimeContext<EntityDict> {
    static FromCxtStr(cxtStr?: string){
        const {
            token,
            applicationId,
            scene
        } = cxtStr ? GeneralRuntimeContext.fromString(cxtStr) : {
            token: undefined,
            applicationId: undefined,
            scene: undefined,
        };
        return (store: RowStore<EntityDict, RuntimeContext>) => {
            const context = new RuntimeContext(store, applicationId);
            context.setScene(scene);
            context.setToken(token);
            return context;
        };
    }
}