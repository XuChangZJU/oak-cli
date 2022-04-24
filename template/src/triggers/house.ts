import { EntityDict } from "oak-app-domain";
import { Trigger } from "oak-domain/lib/types";
import { RuntimeContext } from "../RuntimeContext";

export const triggers: Trigger<EntityDict, 'house', RuntimeContext>[] = [
    {
        name: '创建房屋后通知管理员',
        entity: 'house',
        action: 'create',
        when: 'after',
        fn: async (event, context) => {
            const { operation: { data } } = event;
            if (data instanceof Array) {
                data.forEach(
                    ele => console.log(`房屋${ele.id}已经建立`)
                );
                return data.length;
            }
            else {
                console.log(`房屋${data.id}已经建立`);
                return 1;
            }
        }
    }
];