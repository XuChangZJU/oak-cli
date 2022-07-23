import WechatMpConfig from '../../wechatMp/src/project.config.json';

export default {
    weChatMp: {
        // 第一个小程序的配置
        appId: WechatMpConfig.appid, // 请到progjection.config.json中修改
        appSecret: 'b40433d3b20e1eea5544fcf6f4bbe291', // appSecret
        appName: WechatMpConfig.projectname, // 请到progjection.config.json中修改
    },
    System: {
        develop: {
            name: 'develop',
            description: '开发用的system',
            config: {
                Map: {
                    amap: {
                        webApiKey: '',
                    },
                },
                Cos: {
                    qiniu: {
                        accessKey: '',
                        secretKey: '',
                        uploadHost: 'https://up.qiniup.com', //七牛上传域名
                        bucket: 'test',
                        domain: '',
                        protocol: 'http',
                    },
                },
            },
        },
    },
};
