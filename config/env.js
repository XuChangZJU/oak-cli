const path = require('path');

/** 环境变量 */
exports.NODE_ENV = process.env.NODE_ENV || 'development';
/** 环境变量 */
exports.TARGET = process.env.TARGET || 'mp';
/** 项目路径 */
exports.ROOT = path.join(process.cwd());
/** 项目路径 */
exports.SOURCE = path.join(this.ROOT, 'src');
/** Mp项目路径 */
exports.MP_ROOT = path.join(process.cwd(), 'wechatMp');
/** Mp源代码存放路径 */
exports.MP_SOURCE = path.resolve(this.MP_ROOT, 'src');
/** Mp目标代码存放路径 */
exports.MP_DESTINATION = path.resolve(this.MP_ROOT, 'dist');
/** Mp配置脚本文件路径 */
exports.MP_SCRIPTS = path.resolve(this.MP_ROOT, 'scripts');
/** .env Mp配置文件路径 */
exports.MP_ENV_CONFIG = path.resolve(this.MP_ROOT, '.env');
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
