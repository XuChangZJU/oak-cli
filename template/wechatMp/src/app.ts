import './utils/polyfill';

import { handler as exceptionHandler } from '@project/exceptionHandler';
import { compareVersion } from 'oak-domain/lib/utils/version';

import { sdkVersion } from './configuration';
import { features } from './initialize';

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
        //微信SDKVersion比较，检查小程序有没有新版本发布
        const curVersion = wx.getSystemInfoSync().SDKVersion;
        if (compareVersion(curVersion, sdkVersion) >= 0) {
            const updateManager = wx.getUpdateManager();
            updateManager.onCheckForUpdate(({ hasUpdate }) => {
                if (hasUpdate) {
                    updateManager.onUpdateReady(() => {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好，是否重启当前应用？',
                            showCancel: false,
                        }).then(({ confirm }) => {
                            if (confirm) {
                                // 新的版本已经下载好，调用applyUpdate应用新版本并重启
                                updateManager.applyUpdate();
                            }
                        });
                    });
                }
            });

            // 新版本下载失败时执行
            updateManager.onUpdateFailed(() => {
                wx.showModal({
                    title: '发现新版本',
                    content: '请删除当前小程序，重新搜索打开...',
                    showCancel: false,
                });
            });
        } else {
            //如果小程序需要在最新的微信版本体验，如下提示
            wx.showModal({
                title: '更新提示',
                content:
                    '当前微信版本过低，无法使用最新功能，请升级到最新微信版本后重试。',
                showCancel: false,
            });
        }
        // 等application初始化完成后进行登录
        await features.application.initialize();
        if (!features.token.getTokenValue()) {
            await features.token.loginWechatMp();
        }
    },

    onHide() {
        console.log('onHide');
    },

    onError(err) {
        console.error(err);
    },

    onUnhandledRejection(rejection) {
        const { reason } = rejection;
        exceptionHandler(reason, features);
    },
});
