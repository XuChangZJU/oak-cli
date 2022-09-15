import './utils/polyfill';

import initialize from '../../src/initialize';

/**
 * 初始化，小程序这里必须输入访问的目标域名，系统根据domain和system的关系来判定appId
 */
const url = 'localhost';
const systemInfo = wx.getSystemInfoSync();
const { language } = systemInfo; // 系统语言
let translations: Record<string, any> = {};
if (language === 'zh_CN') {
    translations = require('./locales/zh_CN.json');
}
const i18nOptions = {
    translations,
    defaultLocale: language,
};
const { features } = initialize('wechatMp', url, i18nOptions);

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
        // 首先获取app信息，登录由用户逻辑主宰
        await features.application.getApplication();
        // features.token.loginWechatMp();
    },

    onHide() {
        console.log('onHide');
    },
});
