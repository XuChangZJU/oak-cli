import { BackendRuntimeContext } from '../context/BackendRuntimeContext';
import { EntityDict } from '@oak-app-domain';

export type AspectDict = {
    test: (params: string, context: BackendRuntimeContext) => Promise<any>;
};
