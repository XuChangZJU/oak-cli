
import { CreateOperationData as Application } from '@oak-app-domain/Application/Schema';
import { CreateOperationData as System } from '@oak-app-domain/System/Schema';
import { CreateOperationData as Platform } from '@oak-app-domain/Platform/Schema';
import { CreateOperationData as Domain } from '@oak-app-domain/Domain/Schema';

export const DEV_WECHATMP_APPLICATION_ID = 'MY_DEV_WECHATMP_APPLICATION_ID';
export const DEV_WEB_APPLICATION_ID = 'MY_DEV_WEB_APPLICATION_ID';
export const DEV_PUBLIC_APPLICATION_ID = 'MY_DEV_PUBLIC_APPLICATION_ID';
export const DEV_WECHATPUPLIC_APPLICATION_ID = 'MY_DEV_WECHATPUPLIC_APPLICATION_ID';
export const DEV_DOMAIN_ID = 'MY_DEV_DOMAIN_ID';
export const DEV_SYSTEM_ID = 'MY_DEV_SYSTEM_ID';

const SUPER_SYSTEM_ID = 'SUPER_SYSTEM_ID';
const SUPER_WEB_APPLICATION_ID = 'SUPER_WEB_APPLICATION_ID';
const SUPER_DOMAIN_ID = 'SUPER_DOMAIN_ID';

/**
 * 配置系统相关的初始化数据
 */
export const application: Application[] = [
    {
        id: DEV_WECHATMP_APPLICATION_ID,
        name: 'wechatMp',
        type: 'wechatMp',
        systemId: DEV_SYSTEM_ID,
        config: {
            type: 'wechatMp',
            appId: '',
            appSecret: '',
        },
        description: '小程序应用，指向dev_system',
    },
    {
        id: DEV_WEB_APPLICATION_ID,
        name: '测试web',
        type: 'web',
        systemId: DEV_SYSTEM_ID,
        config: {
            type: 'web',
            passport: ['email', 'mobile', 'wechat'],
        },
        description: 'web应用，指向dev_system',
    },
    {
        id: DEV_PUBLIC_APPLICATION_ID,
        name: '测试public',
        type: 'wechatPublic',
        systemId: DEV_SYSTEM_ID,
        config: {
            type: 'wechatPublic',
            isService: true,
            appId: 'wx850874243dbcb34a',
            appSecret: '6fae672615730c0c1ea58e83621ad7c9',
        },
        description: 'public应用，指向dev_system',
    },
    {
        /** *
         *  线上第一个web应用，请根据应用情况配置
         * */
        id: SUPER_WEB_APPLICATION_ID,
        name: '线上',
        type: 'web',
        systemId: SUPER_SYSTEM_ID,
        config: {
            type: 'web',
            passport: ['mobile', 'wechat'],
        },
        description: '线上网站',
    },
];

export const system: System[] = [
    {
        // 测试用系统，可将自己申请相应的服务帐号填在这里，用于开发过程
        id: DEV_SYSTEM_ID,
        name: '测试系统',
        description: '测试系统',
        config: {
            Map: {
                amap: {
                    webApiKey: '',
                },
            },
            Cos: {
                qiniu: {
                    accessKey: '',
                    buckets: [
                        {
                            zone: 'z0',
                            name: '',
                            domain: '',
                            protocol: 'http',
                        },
                    ],
                    defaultBucket: '',
                },
            },
            Live: {
                qiniu: {
                    accessKey: '',
                    liveHost: '', // 七牛直播云接口
                    publishDomain: '', // rtmp
                    playDomain: '', // rtmp
                    hub: '',
                    publishKey: '',
                    playKey: '',
                    playBackDomain: '',
                },
            },
            Account: {
                qiniu: [
                    {
                        accessKey: '',
                        secretKey: '',
                    },
                ],
            },
            App: {},
        },
        super: true,
        folder: 'test',
        style: {
            color: {
                primary: 'red',
            },
        },
    },
    {
        /**
         * 线上真实系统，请勿将敏感帐号填在这里，上线后在系统中配置
         * */
        id: SUPER_SYSTEM_ID,
        name: '线上系统',
        description: '线上系统',
        config: {
            App: {},
        },
        super: true,
        folder: 'test',
        style: {
            color: {
                primary: 'red',
            },
        },
    },
];

export const domain: Domain[] = [
    {
        id: DEV_DOMAIN_ID,
        protocol: 'http',
        url: 'localhost',
        port: 3001,
        systemId: DEV_SYSTEM_ID,
    },
    {
        /**
         *  线上真实域名，此信息必须在应用启动前初始化，否则系统无法访问
         * */
        id: SUPER_DOMAIN_ID,
        protocol: 'https',
        url: 'test.com',
        port: 443,
        apiPath: '/rest/aspect',
        systemId: SUPER_SYSTEM_ID,
    },
];



export const data = {
    application,
    system,
    domain,
};