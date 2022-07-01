const webpack = require('webpack');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const resolve = require('resolve');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const UiExtractPlugin = require('ui-extract-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const OakWeChatMpPlugin = require('../../plugins/WechatMpPlugin');

const getClientEnvironment = require('./env');

const paths = require('./paths');
const env = getClientEnvironment();
const pkg = require(paths.appPackageJson);

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

const copyPatterns = [].concat(pkg.copyWebpack || []).map((pattern) =>
    typeof pattern === 'string'
        ? {
              from: path.resolve(paths.appSrc, pattern),
              to: path.resolve(paths.appBuild, pattern),
          }
        : pattern
);
const oakRegex = /(\/*[a-zA-Z0-9_-])*\/app\/|(\\*[a-zA-Z0-9_-])*\\app\\/;
const localRegex = /(\/*[a-zA-Z0-9_-])*\/src+\/|(\\*[a-zA-Z0-9_-])*\\src+\\/;

module.exports = function (webpackEnv) {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';

    const relativeFileLoader = (ext = '[ext]') => {
        return {
            loader: 'file-loader',
            options: {
                useRelativePath: true,
                name: `[path][name].${ext}`,
                context: paths.appSrc,
            },
        };
    };

    const oakFileLoader = (ext = '[ext]') => {
        return {
            loader: 'file-loader',
            options: {
                useRelativePath: true,
                name: `[path][name].${ext}`,
                outputPath: (url, resourcePath, context) => {
                    const outputPath = url.replace(oakRegex, '');
                    return outputPath;
                },
                context: paths.appSrc,
            },
        };
    };

    const localFileLoader = (ext = '[ext]') => {
        return {
            loader: 'file-loader',
            options: {
                useRelativePath: true,
                name: `[path][name].${ext}`,
                outputPath: (url, resourcePath, context) => {
                    const outputPath = url.replace(localRegex, '');
                    return outputPath;
                },
                context: paths.appSrc,
            },
        };
    };

    const getOakInclude = () => {
        return isEnvProduction
            ? [/oak-general-business/]
            : [
                  /oak-domain/,
                  /oak-external-sdk/,
                  /oak-frontend-base/,
                  /oak-general-business/,
                  /oak-memory-tree-store/,
                  /oak-common-aspect/,
              ];
    };

    return {
        target: ['web'],
        // Webpack noise constrained to errors and warnings
        stats: 'errors-warnings',
        mode: isEnvProduction
            ? 'production'
            : isEnvDevelopment && 'development',
        // Stop compilation early in production
        bail: isEnvProduction,
        devtool: isEnvProduction
            ? shouldUseSourceMap
                ? 'source-map'
                : false
            : isEnvDevelopment && 'cheap-module-source-map',
        entry: {
            app: isEnvProduction ? paths.appIndexJs : paths.appIndexDevJs,
        },
        output: {
            path: paths.appBuild,
            filename: '[name].js',
            publicPath: paths.publicUrlOrPath,
            globalObject: 'global',
        },
        resolve: {
            alias: {
                '@': paths.appSrc,
                assert: require.resolve('assert'),
            },
            extensions: paths.moduleFileExtensions.map((ext) => `.${ext}`),
            symlinks: true,
            fallback: {
                crypto: require.resolve('crypto-browserify'),
                buffer: require.resolve('safe-buffer'),
                stream: require.resolve('stream-browserify'),
            },
        },
        resolveLoader: {
            // 第一种使用别名的方式引入自定义的loader
            alias: {
                'wxml-loader': path.resolve(
                    __dirname,
                    '../loaders/wxml-loader.js'
                ),
            },
            // 第二种方式选查找自己的loaders文件中有没有这个loader再查找node_modules文件
            // modules: [path.resolve(__dirname, 'loaders'), 'node_modules'],
        },
        optimization: {
            // 标记未被使用的代码
            usedExports: true,
            // 删除 usedExports 标记的未使用的代码
            minimize: isEnvProduction,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                }),
            ],
        },
        module: {
            rules: [
                {
                    test: /\.wxs$/,
                    include: paths.appSrc,
                    type: 'javascript/auto',
                    use: [relativeFileLoader()],
                },
                {
                    test: /\.wxs$/,
                    include: oakRegex,
                    exclude: paths.appSrc,
                    type: 'javascript/auto',
                    use: [oakFileLoader('wxs')],
                },
                {
                    test: /\.wxs$/,
                    include: paths.appOutSrc,
                    type: 'javascript/auto',
                    use: [oakFileLoader('wxs')],
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    include: paths.appSrc,
                    type: 'javascript/auto',
                    use: relativeFileLoader(),
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    include: oakRegex,
                    exclude: paths.appSrc,
                    type: 'javascript/auto',
                    use: oakFileLoader(),
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    include: paths.appOutSrc,
                    type: 'javascript/auto',
                    use: localFileLoader(),
                },
                {
                    test: /\.less$/,
                    include: paths.appSrc,
                    exclude: /node_modules/,
                    use: [
                        relativeFileLoader('wxss'),
                        {
                            loader: 'less-loader',
                        },
                    ],
                },
                {
                    test: /\.less$/,
                    include: oakRegex,
                    exclude: paths.appSrc,
                    type: 'javascript/auto',
                    use: [
                        oakFileLoader('wxss'),
                        {
                            loader: 'less-loader',
                            options: {
                                lessOptions: () => {
                                    const oakConfigJson = require(paths.oakConfigJson);
                                    return {
                                        javascriptEnabled: true,
                                        modifyVars: oakConfigJson.theme,
                                    };
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.less$/,
                    include: paths.appOutSrc,
                    type: 'javascript/auto',
                    use: [
                        localFileLoader('wxss'),
                        {
                            loader: 'less-loader',
                            options: {
                                lessOptions: () => {
                                    const oakConfigJson = require(paths.oakConfigJson);
                                    return {
                                        javascriptEnabled: true,
                                        modifyVars: oakConfigJson.theme,
                                    };
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.js$/,
                    include: [paths.appSrc, paths.appOutSrc].concat(
                        getOakInclude()
                    ),
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                },
                {
                    test: /\.((?!tsx)ts)$/,
                    include: [paths.appSrc, paths.appOutSrc].concat(
                        getOakInclude()
                    ),
                    exclude: /node_modules/,
                    loader: 'ts-loader',
                    options: {
                        configFile: paths.appTsConfig,
                        context: paths.appOutPath,
                        transpileOnly: true,
                    },
                },
                // {
                //     test: /\.json$/,
                //     include: paths.appSrc,
                //     exclude: /node_modules/,
                //     type: 'asset/resource',
                //     generator: {
                //         filename: `[path][name].[ext]`,
                //     },
                //     // type: 'javascript/auto',
                //     // use: [relativeFileLoader('json')],
                // },
                {
                    test: /\.(xml|wxml)$/,
                    include: paths.appSrc,
                    exclude: /node_modules/,
                    type: 'javascript/auto',
                    use: [
                        relativeFileLoader('wxml'),
                        {
                            loader: 'wxml-loader',
                            options: {
                                context: paths.appSrc,
                            },
                        },
                    ],
                },
                {
                    test: /\.(xml|wxml)$/,
                    include: oakRegex,
                    exclude: paths.appSrc,
                    type: 'javascript/auto',
                    use: [
                        oakFileLoader('wxml'),
                        {
                            loader: 'wxml-loader',
                            options: {
                                context: paths.appSrc,
                            },
                        },
                    ],
                },
                {
                    test: /\.(xml|wxml)$/,
                    include: paths.appOutSrc,
                    type: 'javascript/auto',
                    use: [
                        localFileLoader('wxml'),
                        {
                            loader: 'wxml-loader',
                            options: {
                                context: paths.appSrc,
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new UiExtractPlugin({ context: paths.appSrc }),
            new OakWeChatMpPlugin({
                context: paths.appSrc,
                extensions: paths.moduleFileExtensions.map((ext) => `.${ext}`),
                exclude: ['*/weui-miniprogram/*'],
                include: ['project.config.json', 'sitemap.json'],
                split: !isEnvDevelopment,
            }),
            new webpack.DefinePlugin(env.stringified),
            new StylelintPlugin({
                fix: true,
                files: '**/*.(sa|sc|le|wx|c)ss',
                context: paths.appSrc,
            }),
            new ProgressBarPlugin({
                summary: false,
                format: ':msg :percent (:elapsed seconds)',
                customSummary: (buildTime) =>
                    console.log(
                        chalk.gray(`\n[${new Date().toLocaleDateString()}`),
                        chalk.green(`Compiled successfully!(${buildTime})\n`)
                    ),
            }),
            // TypeScript type checking
            useTypeScript &&
                new ForkTsCheckerWebpackPlugin({
                    async: isEnvDevelopment,
                    typescript: {
                        typescriptPath: resolve.sync('typescript', {
                            basedir: paths.appNodeModules,
                        }),
                        // configOverwrite: {
                        //     compilerOptions: {
                        //         sourceMap: isEnvProduction
                        //             ? shouldUseSourceMap
                        //             : isEnvDevelopment,
                        //         skipLibCheck: true,
                        //         inlineSourceMap: false,
                        //         declarationMap: false,
                        //         noEmit: true,
                        //         incremental: true,
                        //         tsBuildInfoFile: paths.appTsBuildInfoFile,
                        //     },
                        // },
                        configFile: paths.appTsConfig,
                        context: paths.appOutPath,
                        diagnosticOptions: {
                            // semantic: true,
                            syntactic: true,
                        },
                        mode: 'write-references',
                        // profile: true,
                    },
                    issue: {
                        // This one is specifically to match during CI tests,
                        // as micromatch doesn't match
                        // otherwise.
                        include: [
                            { file: '../**/src/**/*.ts' },
                            { file: '**/src/**/*.ts' },
                        ],
                        exclude: [
                            { file: '**/src/**/__tests__/**' },
                            { file: '**/src/**/?(*.){spec|test}.*' },
                            { file: '**/src/setupProxy.*' },
                            { file: '**/src/setupTests.*' },
                        ],
                    },
                    logger: {
                        infrastructure: 'silent',
                    },
                }),
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            }),
        ].concat(
            copyPatterns.length > 0
                ? [
                      new CopyWebpackPlugin({
                          patterns: copyPatterns,
                      }),
                  ]
                : []
        ),
        watch: true,
        watchOptions: {
            aggregateTimeout: 600,
            ignored: '**/node_modules',
            followSymlinks: true,
        },
    };
};
