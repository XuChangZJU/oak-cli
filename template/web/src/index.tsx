import './utils/polyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import './index.less';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ResponsiveProvider } from 'oak-frontend-base/lib/platforms/web/responsive';
import { getAppType } from './utils/env';
import initialize from '../../src/initialize';

const appType = getAppType();
const { features, i18n } = initialize(appType, window.location.hostname);
Object.assign(global, {
    features,
})

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

features.application.getApplication()
.then(
    () => {
        root.render(
            // <React.StrictMode>
            <BrowserRouter>
                <I18nextProvider i18n={i18n as any}>
                    <ResponsiveProvider>
                        <App />
                    </ResponsiveProvider>
                </I18nextProvider>
            </BrowserRouter>
            // </React.StrictMode>
        );
    }
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
