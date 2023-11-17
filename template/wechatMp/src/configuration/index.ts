
/**
 * 初始化，小程序这里必须输入访问的目标域名，系统根据domain和system的关系来判定appId
 */
const accountInfo = wx.getAccountInfoSync();
const envVersion = accountInfo.miniProgram.envVersion; //develop\trial\release

const URL = {                           // 服务器地址数组，和domain中要保持一致以界定application
    develop: 'localhost',
    trial: 'dev.oak-app-id.com',
    release: 'www.oak-app-id.com',
};

const host = URL[envVersion];
const sdkVersion = '2.25.1';                   // 小程序运行所需要的sdk最低版本

export {
    host,                           
    sdkVersion,
};