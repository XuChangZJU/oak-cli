import { EntityDict } from '@oak-app-domain';

interface ActionAuth<T extends keyof EntityDict> {
    id: string;
    paths: string[];
    relationId?: string;
    destEntity: T;
    deActions: EntityDict[T]['Action'][],
}

export const actionAuth: ActionAuth<keyof EntityDict>[] = [

]