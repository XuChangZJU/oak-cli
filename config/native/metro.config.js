
const { resolve } = require('path');
const watchFolders = [
    '../src', '../node_modules', '../../oak-domain', '../../oak-common-aspect', '../../oak-external-sdk',
    '../../oak-frontend-base', '../../oak-general-business', '../../oak-memory-tree-store'
];

const sourceExts =
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging' ||
    process.env.PROD === 'true'
        ? [
              'prod.native.js',
              'prod.native.ts',
              'prod.native.jsx',
              'prod.native.tsx',
              'prod.js',
              'prod.ts',
              'prod.jsx',
              'prod.tsx',
              'js',
              'ts',
              'jsx',
              'tsx',
              'less',
              'json',
              'svg',
          ]
        : [
              'dev.native.js',
              'dev.native.ts',
              'dev.native.jsx',
              'dev.native.tsx',
              'dev.js',
              'dev.ts',
              'dev.jsx',
              'dev.tsx',
              'js',
              'ts',
              'jsx',
              'tsx',
              'less',
              'json',
              'svg',
          ];

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
