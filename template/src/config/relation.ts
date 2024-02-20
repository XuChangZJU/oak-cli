import { AuthDeduceRelationMap, SelectFreeEntities, UpdateFreeDict } from 'oak-domain/lib/types/Entity';
import { selectFreeEntities as ogbSFF, authDeduceRelationMap as ogbADR, updateFreeDict as obgUFD } from 'oak-general-business/lib/config/relation';
import { EntityDict } from '@project/oak-app-domain';

// 此对象所标识的entity的权限由其外键指向的父对象判定
export const authDeduceRelationMap: AuthDeduceRelationMap<EntityDict> = {
    ...ogbADR,
};

export const selectFreeEntities = (ogbSFF as SelectFreeEntities<EntityDict>).concat([

]);

export const updateFreeDict: UpdateFreeDict<EntityDict> = {
    ...obgUFD
};