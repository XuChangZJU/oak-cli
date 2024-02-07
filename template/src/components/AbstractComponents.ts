/**
 * 抽象组件在业务层根据EntityDict的重新声明
 * by Xc 20230807
 */

import { EntityDict } from '@project/oak-app-domain';

import { TableProps, PaginationProps } from 'antd';
import { ReactComponentProps, ColumnProps, RowWithActions, OakExtraActionProps, 
    OakAbsAttrDef, onActionFnDef, ListButtonProps, OakAbsAttrUpsertDef, ColumnMapType } from 'oak-frontend-base';
import AbsFilterPanel from 'oak-frontend-base/es/components/filterPanel';
import AbsList from 'oak-frontend-base/es/components/list';
import AbsListPro from 'oak-frontend-base/es/components/listPro';
import AbsDetail from 'oak-frontend-base/es/components/detail';
import AbsUpsert from 'oak-frontend-base/es/components/upsert';

const FilterPanel = AbsFilterPanel as (
    ...props: Parameters<typeof AbsFilterPanel<EntityDict, keyof EntityDict>>
) => React.ReactElement;

const List = AbsList as (
    ...props: Parameters<typeof AbsList<EntityDict, keyof EntityDict>>
) => React.ReactElement;

const ListPro = AbsListPro as (
    ...props: Parameters<typeof AbsListPro<EntityDict, keyof EntityDict>>
) => React.ReactElement;

const Detail = AbsDetail as (
    ...props: Parameters<typeof AbsDetail<EntityDict, keyof EntityDict>>
) => React.ReactElement;

const Upsert = AbsUpsert as (
    ...props: Parameters<typeof AbsUpsert<EntityDict, keyof EntityDict>>
) => React.ReactElement;

export {
    FilterPanel,
    List,
    ListPro,
    Detail,
    Upsert,

    ReactComponentProps, ColumnProps, RowWithActions, OakExtraActionProps, OakAbsAttrDef, onActionFnDef,
}
