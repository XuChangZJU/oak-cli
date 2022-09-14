import { EntityDict } from "oak-app-domain";
import { Trigger } from "oak-domain/lib/types";
import { RuntimeContext } from '../context/RuntimeContext';

export const triggers: Trigger<EntityDict, 'book', RuntimeContext>[] = [
    {
        name: '创建图书后通知管理员',
        entity: 'book',
        action: 'create',
        when: 'after',
        fn: async (event, context) => {
            const {
                operation: { data },
            } = event;
            if (data instanceof Array) {
                data.forEach((ele) => console.log(`图书${ele.id}已经建立`));
                return data.length;
            } else {
                console.log(`图书${data.id}已经建立`);
                return 1;
            }
        },
    },
];