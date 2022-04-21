
export const CLI_VERSION = require('../package.json')['version']
export const CLI_NAME = require('../package.json')['name']

export const BASE_DIR = process.cwd()

export const USER_CONFIG_FILE_NAME = 'oak.config.json'
export const USER_CONFIG_FILE = BASE_DIR + '/' + USER_CONFIG_FILE_NAME

export const NODE_MODULES_DIR_NAME = 'node_modules'

export const CNPM_BASE_URL = '' //oak-cli
export const MINI_VERSION_URL = 'https://mp.weixin.qq.com/debug/getpublibpercentage'