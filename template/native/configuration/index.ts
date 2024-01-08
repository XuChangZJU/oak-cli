
/**
 * 初始化，App也必须输入访问的目标域名，系统根据domain和system的关系来判定appId
 */
const env = process.env.NODE_ENV;

const URL = {
  // 服务器地址数组，和application的domain中要保持一致以确定application
  development: 'localhost',
  staging: 'test.com',
  production: 'test.com',
};

const host = URL[env];

export {
    host,
};