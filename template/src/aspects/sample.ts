import { EntityDict } from 'oak-app-domain';
import { RuntimeContext } from '../RuntimeContext';

export async function test(params: string, context: RuntimeContext) {
    return 'hello world';
}
