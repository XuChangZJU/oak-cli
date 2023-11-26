
const { resolve } = require('path');
const watchFolders = process.env.NODE_ENV === 'production' ? ['../src', '../node_modules'] : [
    '../src', '../node_modules', '../../oak-domain', '../../oak-common-aspect', '../../oak-external-sdk',
    '../../oak-frontend-base', '../../oak-general-business', '../../oak-memory-tree-store'
];

const sourceExts = (process.env.NODE_ENV === 'production' || process.env.PROD === 'true') ?
    ['prod.ts', 'ts', 'tsx', 'prod.js', 'js', 'jsx', 'less', 'json'] :
    ['dev.ts', 'ts', 'tsx', 'dev.js', 'js', 'jsx', 'less', 'json'];

const NullModules = ['fs', 'url'];
/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    transformer: {
        babelTransformerPath: resolve(__dirname, 'transformer.js'),
        // hermesParser: true,
    },
    resolver: {
        sourceExts,
        resolveRequest: (context, moduleName, platform) => {
            if (NullModules.includes(moduleName)) {
                return {
                    type: 'empty',
                };
            }
            return context.resolveRequest(context, moduleName, platform);
        },
        nodeModulesPaths: [resolve(process.cwd(), '..', 'node_modules')],          // development模式下，oak的库是以文件方式链接，其自身的node_modules里可能会缺失一些库
    },
    watchFolders,
};

module.exports = config;
