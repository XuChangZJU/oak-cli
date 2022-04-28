import { CreateOperationData as Application } from 'oak-app-domain/Application/Schema';
import { DEV_SYSTEM_ID } from './system';
const DEV_WECHATMP_APPLICATION_ID = 'MY_DEV_WECHATMP_APPLICATION_ID';
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
    }
];