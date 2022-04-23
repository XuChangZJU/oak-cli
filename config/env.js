const path = require('path');

/** 环境变量 */
exports.NODE_ENV = process.env.NODE_ENV || 'development';
/** 项目路径 */
exports.ROOT = path.join(process.cwd(), 'wechatMp');
/** 源代码存放路径 */
exports.SOURCE = path.resolve(this.ROOT, 'src');
/** 目标代码存放路径 */
exports.DESTINATION = path.resolve(this.ROOT, 'dist');
/** 配置脚本文件路径 */
exports.SCRIPTS = path.resolve(this.ROOT, 'scripts');
/** .env 配置文件路径 */
exports.ENV_CONFIG = path.resolve(this.ROOT, '.env');
/** 默认配置文件 */
exports.DEFAULT_CONFIG = {
  platform: 'wx',
  css_unit_ratio: 1,
};
/** 平台映射字典 */
exports.PLATFORM_CONFIG = {
  wx: {
    template: '.wxml',
    style: '.wxss',
  },
  swan: {
    template: '.swan',
    style: '.css',
  },
};
