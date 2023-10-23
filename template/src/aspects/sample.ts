import { EntityDict } from '@oak-app-domain';
import { BackendRuntimeContext } from '../context/BackendRuntimeContext';

export async function test(params: string, context: BackendRuntimeContext) {
    return 'hello world';
}
