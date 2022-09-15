import { EntityDict } from 'oak-app-domain';
import { RowStore } from 'oak-domain/lib/types';
import { RuntimeContext } from './RuntimeContext';
import { BackendRuntimeContext as GeneralBackendRuntimeContext } from 'oak-general-business/lib/context/BackendRuntimeContext';

export class BackendRuntimeContext extends GeneralBackendRuntimeContext<EntityDict> implements RuntimeContext{
    static FromSerializedString(str?: string) {
        if (str) {
            const data = JSON.parse(str);
            
            return async (store: RowStore<EntityDict, RuntimeContext>) => {
                const context = new BackendRuntimeContext(store);
                await context.initialize(data);
                return context;
            };
        }
        else {
            return async (store: RowStore<EntityDict, RuntimeContext>) => {
                const context = new BackendRuntimeContext(store);
                await context.initialize();
                return context;
            };
        }
    }
}