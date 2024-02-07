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
    props: ReactComponentProps<
        EntityDict,
        T,
        false,
        {
            entity: T;
            columns: ColumnProps<EntityDict, T>[];
        }
    >
) => React.ReactElement;

const List = AbsList as <T extends keyof EntityDict>(
    props: ReactComponentProps<
        EntityDict,
        T,
        false,
        {
            entity: T;
            extraActions: OakExtraActionProps[];
            onAction: onActionFnDef;
            disabledOp: boolean;
            attributes: OakAbsAttrDef[];
            data: RowWithActions<EntityDict, T>[];
            loading: boolean;
            tablePagination?: TableProps<
                RowWithActions<EntityDict, T>[]
            >['pagination'];
            rowSelection?: {
                type: 'checkbox' | 'radio';
                selectedRowKeys?: string[];
                onChange: (
                    selectedRowKeys: string[],
                    row: RowWithActions<EntityDict, T>[],
                    info?: { type: 'single' | 'multiple' | 'none' }
                ) => void;
            };
            hideHeader: boolean;
        }
    >
) => React.ReactElement;

const ListPro = AbsListPro as <T extends keyof EntityDict>(
    props: {
        title?: string;
        buttonGroup?: ListButtonProps[];
        onReload?: () => void;
        entity: T;
        extraActions?: OakExtraActionProps[];
        onAction?: onActionFnDef;
        disabledOp?: boolean;
        attributes: OakAbsAttrDef[];
        data: RowWithActions<EntityDict, T>[];
        loading?: boolean;
        tablePagination?: TableProps<
            RowWithActions<EntityDict, T>[]
        >['pagination'];
        rowSelection?: {
            type: 'checkbox' | 'radio';
            selectedRowKeys?: string[];
            onChange: (
                selectedRowKeys: string[],
                row: RowWithActions<EntityDict, T>[],
                info?: { type: 'single' | 'multiple' | 'none' }
            ) => void;
        };
    }
) => React.ReactElement;

const Detail = AbsDetail as <T extends keyof EntityDict>(
    props: ReactComponentProps<
        EntityDict,
        T,
        false,
        {
            column?: ColumnMapType;
            entity: T;
            attributes: OakAbsAttrDef[];
            data: Partial<EntityDict[T]['Schema']>;
            title?: string;
            bordered?: boolean;
            layout?: 'horizontal' | 'vertical',
        }
    >
) => React.ReactElement;

const Upsert = AbsUpsert as <T extends keyof EntityDict, T2 extends keyof EntityDict = keyof EntityDict>(
    props: ReactComponentProps<
        EntityDict,
        T,
        false,
        {
            helps: Record<string, string>;
            entity: T;
            attributes: OakAbsAttrUpsertDef<EntityDict, T, T2>[];
            data: EntityDict[T]['Schema'];
            layout: 'horizontal' | 'vertical';
            mode: 'default' | 'card';
        }
    >
) => React.ReactElement;

export {
    FilterPanel,
    List,
    ListPro,
    Detail,
    Upsert,

    ReactComponentProps, ColumnProps, RowWithActions, OakExtraActionProps, OakAbsAttrDef, onActionFnDef,
}
