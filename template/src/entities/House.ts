import { String, Int, Datetime, Image, Boolean, Text } from 'oak-domain/lib/types/DataType';
import { ActionDef } from 'oak-domain/lib/types/Action';
import { Schema as Area } from 'oak-general-business/lib/entities/Area';
import { Schema as User } from 'oak-general-business/lib/entities/User';
import { Schema as ExtraFile } from 'oak-general-business/lib/entities/ExtraFile';
import { EntityShape } from 'oak-domain/lib/types/Entity';

export interface Schema extends EntityShape {
    district: String<16>;
    area: Area;
    owner: User;
    dd: Array<ExtraFile>;
};

type IAction = 'online' | 'offline';
type IState = 'online' | ' offline';

const IActionDef: ActionDef<IAction, IState> = {
    stm: {
        online: [' offline', 'online'],
        offline: ['online', ' offline'],
    },
    is: ' offline',
};

type Action = IAction;

