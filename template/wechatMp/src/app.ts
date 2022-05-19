import { features } from './init';

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
        await features.token.loginWechatMp('app:onLaunch');
    },

    onHide() {
        console.log('onHide');
    },
});
