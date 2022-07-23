import './utils/polyfill';

import initialize from '../../src/initialize';

/**
 * 初始化，小程序这里必须输入访问的目标域名，系统根据domain和system的关系来判定appId
 */
const url = 'localhost';
const { features } = initialize('wechatMp', url);

export interface IAppOption {
    globalData: {
        features: typeof features;
    };
}

App<IAppOption>({
    globalData: {
        features,
    },
    async onLaunch() {
        // 等application初始化完成后进行登录
        await features.application.getApplication();
        features.token.loginWechatMp();
    },

    onHide() {
        console.log('onHide');
    },
});
