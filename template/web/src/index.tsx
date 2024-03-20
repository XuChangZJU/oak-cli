import './utils/polyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserHistory } from 'history';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import {
    StyleProvider,
    legacyLogicalPropertiesTransformer,
} from '@ant-design/cssinjs';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';

import {
    ResponsiveProvider,
    FeaturesProvider,
} from 'oak-frontend-base/es/platforms/web';
import './index.less';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { handler as exceptionHandler } from '@project/exceptionHandler';

import { features } from './initialize';
dayjs.locale('zh-cn');

window.addEventListener('unhandledrejection', async (event) => {
    // 全局捕获异常处理
    const { reason } = event;
    const result = await exceptionHandler(reason, features);
    if (result) {
        event.preventDefault();
    }
});

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const history = createBrowserHistory();
features.navigator.setHistory(history);

const init = async () => {
    let error;
    const location = features.navigator.getLocation();
    const searchParams = new URLSearchParams(location.search);
    const appId = searchParams.get('appId');
    try {
        await features.application.initialize(appId);
    } catch (err) {
        error = err;
    }

    const application = features.application.getApplication();
    const folder = application?.system?.folder;

    //微信JSSDK验签时， 在IOS上，无论路由切换到哪个页面，实际真正有效的的签名URL是【第一次进入应用时的URL】
    features.weiXinJsSdk.setLandingUrl(window.location.href);

    // 抓到异常处理 1、token过期 2、网络断了 3、接口请求失败
    root.render(
        <HistoryRouter history={history as any}>
            <ResponsiveProvider>
                <FeaturesProvider features={features as any}>
                    <ConfigProvider locale={zhCN}>
                        <StyleProvider
                            hashPriority="high"
                            transformers={[legacyLogicalPropertiesTransformer]}
                        >
                            <App folder={folder as any} error={error} />
                        </StyleProvider>
                    </ConfigProvider>
                </FeaturesProvider>
            </ResponsiveProvider>
        </HistoryRouter>
    );
};

init();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
