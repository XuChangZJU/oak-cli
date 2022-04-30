import { pick } from 'lodash';
import { WechatMpEnv } from 'oak-app-domain/Token/Schema';
import { features } from  './init';
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
        const { code } = await wx.login();
        const env = await wx.getSystemInfo();
        const env2 = pick(env, [
            'brand',
            'model',
            'pixelRatio',
            'screenWidth',
            'screenHeight',
            'windowWidth',
            'windowHeight',
            'statusBarHeight',
            'language',
            'version',
            'system',
            'platform',
            'fontSizeSetting',
            'SDKVersion'
        ]);
        await features.token.loginWechatMp(code, Object.assign(env2, { type: 'wechatMp' }) as WechatMpEnv);
    },

    onHide() {
        console.log('onHide');
    },
});
