import { CreateOperationData as Application } from 'oak-app-domain/Application/Schema';
import {
    DEV_SYSTEM_ID,
    DEV_WECHATMP_APPLICATION_ID,
    DEV_WEB_APPLICATION_ID,
} from 'oak-general-business';
import Config from '../config';

export const applications: Application[] = [
    {
        id: DEV_WECHATMP_APPLICATION_ID,
        name: Config.weChatMp.appName,
        type: 'wechatMp',
        systemId: DEV_SYSTEM_ID,
        config: {
            type: 'wechatMp',
            appId: Config.weChatMp.appId,
            appSecret: Config.weChatMp.appSecret,
        },
        description: '小程序应用，指向dev_system',
    },
    {
        id: DEV_WEB_APPLICATION_ID,
        name: 'devWeb',
        type: 'web',
        systemId: DEV_SYSTEM_ID,
        config: {
            type: 'web',
        },
        description: 'web应用，指向dev_system',
    },
];
