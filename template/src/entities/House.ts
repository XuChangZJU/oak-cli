import {
    String,
    Int,
    Text,
    Float,
    SingleGeo,
} from 'oak-domain/lib/types/DataType';
import { ActionDef } from 'oak-domain/lib/types/Action';
import { Schema as Area } from 'oak-general-business/lib/entities/Area';
import { Schema as ExtraFile } from 'oak-general-business/lib/entities/ExtraFile';
import { EntityShape } from 'oak-domain/lib/types/Entity';
import { LocaleDef } from 'oak-domain/lib/types/Locale';

export interface Schema extends EntityShape {
    coordinate: SingleGeo; //坐标
    area: Area; //地区
    title: String<32>; //小区名称
    subtitle: String<32>; // 子房间名称
    addrDetail: String<32>; //地址详情
    type: 'ordinary' | 'apartment' | 'villa'; //房屋类型 普通住宅 公寓 别墅
    floor?: Int<2>; //楼层
    totalFloors?: Int<2>; //总楼层
    roomNumber: Int<2>; //房间
    hallNumber: Int<2>; //客厅餐厅
    kitchenNumber: Int<2>; //厨房
    bathroomNumber: Int<2>; //卫生间
    space: Float<3, 2>; //面积
    orientation:
        | 'east'
        | 'south'
        | 'west'
        | 'north'
        | 'southeast'
        | 'northeast'
        | 'southwest'
        | 'northwest'
        | 'northsouth'
        | 'round';
    decorative: 'luxury' | 'hardcover' | 'paperback' | 'roughcast'; //装修类型
    remark?: Text; //备注描述

    price?: Int<4>; //租金 分位
    deposit?: Int<4>; //押金 分位
    rentalType?: 'whole' | 'combine'; //出租类型 整租/合租，只对住宅和别墅有效
    units?: Int<2>; //租期
    unit?: 'year' | 'month' | 'week' | 'day'; //出租方式 租约单位 年月日
    unitsPerPay?: Int<2>; //交租周期
    tel?: String<32>; //联系方式
    files: Array<ExtraFile>;
}

export type Relation = 'owner' | 'manager';

type IAction = 'online' | 'offline';
type IState = 'online' | 'offline';

const IActionDef: ActionDef<IAction, IState> = {
    stm: {
        online: ['offline', 'online'],
        offline: ['online', 'offline'],
    },
    is: 'offline',
};

type Action = IAction;

const locale: LocaleDef<
    Schema,
    Action,
    Relation,
    {
        type: Schema['type'];
        rentalType?: Schema['rentalType'];
        orientation: Schema['orientation'];
        decorative: Schema['decorative'];
        unit?: Schema['unit'];
        iState: IState;
    }
> = {
    zh_CN: {
        attr: {
            coordinate: '坐标',
            area: '地区',
            title: '小区名称',
            subtitle: '副标题',
            addrDetail: '地址',
            type: '房屋类型',
            lock: '锁',
            floor: '楼层',
            totalFloors: '总楼层',
            roomNumber: '房间数',
            hallNumber: '厅数',
            kitchenNumber: '厨房',
            bathroomNumber: '卫生间',
            space: '面积',
            orientation: '朝向',
            decorative: '装修类型',
            remark: '备注描述',
            price: '租金',
            deposit: '押金',
            rentalType: '出租类型',
            units: '租期',
            unit: '租约单位',
            unitsPerPay: '交租周期',
            tel: '联系方式',
            files: '照片',
            iState: '状态',
        },
        action: {
            online: '上线',
            offline: '下线',
        },
        r: {
            owner: '房东',
            manager: '管理员',
        },
        v: {
            type: {
                ordinary: '普通住宅',
                apartment: '公寓',
                villa: '别墅',
            },
            rentalType: {
                whole: '整租',
                combine: '合租',
            },
            unit: {
                year: '年',
                month: '月',
                week: '周',
                day: '天',
            },
            orientation: {
                east: '东',
                south: '南',
                west: '西',
                north: '北',
                southeast: '东南',
                northeast: '东北',
                southwest: '西南',
                northwest: '西北',
                northsouth: '南北',
                round: '通透',
            },
            decorative: {
                luxury: '豪华装',
                hardcover: '精装',
                paperback: '简装',
                roughcast: '毛坯',
            },
            iState: {
                online: '上线',
                offline: '下线',
            },
        },
    },
};
