import { EntityDict } from '@oak-app-domain';
import { AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { RuntimeContext } from './RuntimeContext';
import { BackendRuntimeContext as GeneralBackendRuntimeContext } from 'oak-general-business';
import { IncomingHttpHeaders } from 'http';

export class BackendRuntimeContext
    extends GeneralBackendRuntimeContext<EntityDict>
    implements RuntimeContext
{
    static FromSerializedString(str?: string) {
        const data = str && JSON.parse(str);

        return async (
            store: AsyncRowStore<EntityDict, BackendRuntimeContext>,
            headers?: IncomingHttpHeaders
        ) => {
            const context = new BackendRuntimeContext(store, headers);
            await context.initialize(data);
            return context;
        };
    }

    toString(): string {
        const data = this.getSerializedData();
        return JSON.stringify(data);
    }
}
