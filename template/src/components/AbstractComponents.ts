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

const FilterPanel = AbsFilterPanel as <T extends keyof EntityDict>(
    ...props: Parameters<typeof AbsFilterPanel<EntityDict, T>>
) => React.ReactElement;

const List = AbsList as <T extends keyof EntityDict>(
    ...props: Parameters<typeof AbsList<EntityDict, T>>
) => React.ReactElement;

const ListPro = AbsListPro as <T extends keyof EntityDict>(
    ...props: Parameters<typeof AbsListPro<EntityDict, T>>
) => React.ReactElement;

const Detail = AbsDetail as <T extends keyof EntityDict>(
    ...props: Parameters<typeof AbsDetail<EntityDict, T>>
) => React.ReactElement;

const Upsert = AbsUpsert as <T extends keyof EntityDict>(
    ...props: Parameters<typeof AbsUpsert<EntityDict, T>>
) => React.ReactElement;

export {
    FilterPanel,
    List,
    ListPro,
    Detail,
    Upsert,

    ReactComponentProps, ColumnProps, RowWithActions, OakExtraActionProps, OakAbsAttrDef, onActionFnDef,
}
