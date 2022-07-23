export function getAppType() {
    if (/MicroMessenger/i.test(window.navigator.userAgent)) {
        return 'wechatPublic';
    }
    return 'web';
}