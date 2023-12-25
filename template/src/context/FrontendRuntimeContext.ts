import { EntityDict } from '@oak-app-domain';
import {
    FrontendRuntimeContext as GeneralFrontendRuntimeContext,
    GeneralAspectDict,
} from 'oak-general-business';
import { CommonAspectDict } from 'oak-common-aspect/lib/AspectDict';
import { RuntimeContext } from './RuntimeContext';
import { AspectDict } from '../aspects/AspectDict';
import { BackendRuntimeContext } from './BackendRuntimeContext';
import { SyncContext, SyncRowStore } from 'oak-domain/lib/store/SyncRowStore';

type FullAspectDict = CommonAspectDict<EntityDict, BackendRuntimeContext> &
    AspectDict &
    GeneralAspectDict<EntityDict, BackendRuntimeContext>;

export class FrontendRuntimeContext
    extends GeneralFrontendRuntimeContext<
        EntityDict,
        BackendRuntimeContext,
        FullAspectDict
    >
    implements RuntimeContext
{
    toString(): string {
        const data = this.getSerializedData();
        return JSON.stringify(data);
    }
}
