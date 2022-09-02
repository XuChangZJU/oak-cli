import {
    String,
    Int,
    Text,
    Float,
    SingleGeo,
} from 'oak-domain/lib/types/DataType';
import { ActionDef } from 'oak-domain/lib/types/Action';
import { Schema as ExtraFile } from 'oak-general-business/lib/entities/ExtraFile';
import { EntityShape } from 'oak-domain/lib/types/Entity';
import { LocaleDef } from 'oak-domain/lib/types/Locale';

export interface Schema extends EntityShape {
    number: String<32>; //书编号
    name: String<32>; //书名
    author: String<32>; //作者
    introduction?: Text; //简介
    price?: Int<4>; //价格
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

const locale: LocaleDef<
    Schema,
    Action,
    '',
    {
        iState: IState;
    }
> = {
    zh_CN: {
        attr: {
            number: '编号',
            name: '书名',
            author: '作者',
            introduction: '简介',
            price: '价格',
            files: '照片',
            iState: '状态',
        },
        action: {
            online: '上架',
            offline: '下架',
            disabled: '禁用',
        },
        v: {
            iState: {
                online: '已上架',
                offline: '已下架',
                disabled: '已禁用',
            },
        },
    },
};
