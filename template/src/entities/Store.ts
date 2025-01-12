import {
    String,
    Int,
    Text,
    Float,
    SingleGeo,
} from 'oak-domain/lib/types/DataType';
import { ActionDef, EntityDesc } from 'oak-domain/lib/types';
import { Schema as Area } from 'oak-general-business/lib/entities/Area';
import { Schema as ExtraFile } from 'oak-general-business/lib/entities/ExtraFile';
import { EntityShape } from 'oak-domain/lib/types/Entity';

export interface Schema extends EntityShape {
    coordinate: SingleGeo; //坐标
    area: Area; //地区
    name: String<32>; //名称
    addrDetail: String<32>; //地址详情
    files: Array<ExtraFile>; //封面图
}

type IAction = 'online' | 'offline' | 'disabled';
type IState = 'online' | 'offline' | 'disabled';

const IActionDef: ActionDef<IAction, IState> = {
    stm: {
        online: ['offline', 'online'],
        offline: ['online', 'offline'],
        disabled: [['online', 'offline'], 'disabled'],
    },
    is: 'offline',
};

type Action = IAction;

const entityDesc: EntityDesc<
    Schema,
    Action,
    '',
    {
        iState: IState;
    }
> = {
    indexes: [
        {
            name: 'index_name',
            attributes: [
                {
                    name: 'name',
                },
            ],
            config: {
                unique: true,
            },
        },
    ],
    locales: {
        zh_CN: {
            name: '门店',
            attr: {
                coordinate: '位置',
                area: '地区',
                name: '名称',
                addrDetail: '地址详情',
                files: '照片',
                iState: '状态',
            },
            action: {
                online: '上线',
                offline: '下线',
                disabled: '禁用',
            },
            v: {
                iState: {
                    online: '已上线',
                    offline: '已下线',
                    disabled: '已禁用',
                },
            },
        },
    },
};
