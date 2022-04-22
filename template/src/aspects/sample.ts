import { RuntimeContext } from "oak-general-business";
import { EntityDict } from 'oak-app-domain';

export async function test(params: string, context: RuntimeContext<EntityDict>) {
    return 'hello world';
}
