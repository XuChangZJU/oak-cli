"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MINI_VERSION_URL = exports.CNPM_BASE_URL = exports.NODE_MODULES_DIR_NAME = exports.USER_CONFIG_FILE = exports.USER_CONFIG_FILE_NAME = exports.BASE_DIR = exports.CLI_BIN_NAME = exports.CLI_NAME = exports.CLI_VERSION = void 0;
exports.CLI_VERSION = require('../package.json')['version'];
exports.CLI_NAME = require('../package.json')['name'];
exports.CLI_BIN_NAME = Object.keys(require('../package.json')['bin'])[0];
exports.BASE_DIR = process.cwd();
exports.USER_CONFIG_FILE_NAME = 'oak.config.json';
exports.USER_CONFIG_FILE = exports.BASE_DIR + '/' + exports.USER_CONFIG_FILE_NAME;
exports.NODE_MODULES_DIR_NAME = 'node_modules';
exports.CNPM_BASE_URL = ''; //oak-cli
exports.MINI_VERSION_URL = 'https://mp.weixin.qq.com/debug/getpublibpercentage';
