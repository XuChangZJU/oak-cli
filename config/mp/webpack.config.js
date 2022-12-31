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
const ForkTsCheckerWebpackPlugin =
    process.env.TSC_COMPILE_ON_ERROR === 'true'
        ? require('./../../plugins/ForkTsCheckerWarningWebpackPlugin')
        : require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const OakWeChatMpPlugin = require('../../plugins/WechatMpPlugin');

const getClientEnvironment = require('./env');

const paths = require('./paths');
const env = getClientEnvironment();
const pkg = require(paths.appPackageJson);

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);
const createEnvironmentHash = require('./webpack/persistentCache/createEnvironmentHash');

const oakI18nPlugin = require('../babel-plugin/oakI18n');
const oakPathPlugin = require('../babel-plugin/oakPath');

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const shouldAnalyze = process.env.COMPILE_ANALYZE === 'true';

const copyPatterns = [].concat(pkg.copyWebpack || []).map((pattern) =>
    typeof pattern === 'string'
        ? {
              from: path.resolve(paths.appSrc, pattern),
              to: path.resolve(paths.appBuild, pattern),
          }
        : pattern
);
const oakRegex = /(\/*[a-zA-Z0-9_-])*\/(lib|src)\/|(\\*[a-zA-Z0-9_-])*\\(lib|src)\\/;

module.exports = function (webpackEnv) {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';

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

    const getOakInclude = () => {
        return isEnvProduction
            ? [/oak-general-business/, /oak-frontend-base/]
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
            app: paths.appIndexJs,
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
                '@project': paths.appRootSrc,
                '@oak-general-business': paths.oakGeneralBusinessAppPath,
                '@oak-app-domain': paths.oakAppDomainAppPath,
                'bn.js': require.resolve('bn.js'),
            },
            extensions: paths.moduleFileExtensions.map((ext) => `.${ext}`),
            symlinks: true,
            fallback: {
                crypto: require.resolve('crypto-browserify'),
                buffer: require.resolve('safe-buffer'),
                stream: require.resolve('stream-browserify'),
                events: require.resolve('events/'),
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
        cache: {
            type: 'filesystem',
            version: createEnvironmentHash(env.raw),
            cacheDirectory: paths.appWebpackCache,
            store: 'pack',
            buildDependencies: {
                defaultWebpack: ['webpack/lib/'],
                config: [__filename],
                tsconfig: [paths.appTsConfig, paths.appJsConfig].filter((f) =>
                    fs.existsSync(f)
                ),
            },
        },
        infrastructureLogging: {
            level: 'none',
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
                    include: oakRegex,
                    exclude: /node_modules/,
                    type: 'javascript/auto',
                    use: [oakFileLoader('wxs')],
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    include: oakRegex,
                    exclude: /node_modules/,
                    type: 'javascript/auto',
                    use: oakFileLoader(),
                },
                {
                    test: /\.wxss$/,
                    include: oakRegex,
                    exclude: /node_modules/,
                    type: 'javascript/auto',
                    use: [oakFileLoader('wxss')],
                },
                {
                    test: /\.less$/,
                    include: oakRegex,
                    exclude: /node_modules/,
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
                    test: /\.js$/,
                    include: [paths.appSrc, paths.appRootSrc].concat(
                        getOakInclude()
                    ),
                    //exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        plugins: [oakI18nPlugin, oakPathPlugin],
                        //开启缓存
                        // cacheDirectory: false,
                    },
                },
                {
                    test: /\.ts$/,
                    include: [paths.appSrc, paths.appRootSrc].concat(
                        getOakInclude()
                    ),
                    //exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                plugins: [oakI18nPlugin, oakPathPlugin],
                                //开启缓存
                                // cacheDirectory: false,
                            },
                        },
                        {
                            loader: 'ts-loader',
                            options: {
                                configFile: paths.appTsConfig,
                                context: paths.appRootPath,
                                transpileOnly: true,
                            },
                        },
                    ],
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
                    test: /\.xml$/,
                    include: oakRegex,
                    exclude: /node_modules/,
                    type: 'javascript/auto',
                    use: [
                        oakFileLoader('wxml'),
                        {
                            loader: 'wxml-loader',
                            options: {
                                context: paths.appSrc,
                                cacheDirectory: false,
                            },
                        },
                    ],
                },
                {
                    test: /\.wxml$/,
                    include: oakRegex,
                    exclude: /node_modules/,
                    type: 'javascript/auto',
                    use: [oakFileLoader('wxml')],
                },
            ],
        },
        plugins: [
            new UiExtractPlugin({ context: paths.appSrc }),
            new OakWeChatMpPlugin({
                context: paths.appSrc,
                extensions: paths.moduleFileExtensions.map((ext) => `.${ext}`),
                exclude: [
                    '*/weui-miniprogram/*',
                    '**/*.module.less',
                    '**/web.less',
                    '**/fontawesome.less',
                ],
                include: ['project.config.json', 'sitemap.json'],
                split: isEnvProduction,
                debugPanel: {
                    name: 'oak-debugPanel',
                    show: !isEnvProduction,
                },
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
                        context: paths.appRootPath,
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
                            { file: '../**/app/**/*.ts' },
                            { file: '**/app/**/*.ts' },
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
            shouldAnalyze &&
                new BundleAnalyzerPlugin({
                    // 可以是`server`，`static`或`disabled`。
                    // 在`server`模式下，分析器将启动HTTP服务器来显示软件包报告。
                    // 在“静态”模式下，会生成带有报告的单个HTML文件。
                    // 在`disabled`模式下，你可以使用这个插件来将`generateStatsFile`设置为`true`来生成Webpack Stats JSON文件。
                    analyzerMode: 'server',
                    // 将在“服务器”模式下使用的主机启动HTTP服务器。
                    analyzerHost: '127.0.0.1',
                    // 将在“服务器”模式下使用的端口启动HTTP服务器。
                    analyzerPort: 8888,
                    // 路径捆绑，将在`static`模式下生成的报告文件。
                    // 相对于捆绑输出目录。
                    reportFilename: 'report.html',
                    // 模块大小默认显示在报告中。
                    // 应该是`stat`，`parsed`或者`gzip`中的一个。
                    // 有关更多信息，请参见“定义”一节。
                    defaultSizes: 'parsed',
                    // 在默认浏览器中自动打开报告
                    openAnalyzer: true,
                    // 如果为true，则Webpack Stats JSON文件将在bundle输出目录中生成
                    generateStatsFile: false,
                    // 如果`generateStatsFile`为`true`，将会生成Webpack Stats JSON文件的名字。
                    // 相对于捆绑输出目录。
                    statsFilename: 'stats.json',
                    // stats.toJson（）方法的选项。
                    // 例如，您可以使用`source：false`选项排除统计文件中模块的来源。
                    // 在这里查看更多选项：https： //github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
                    statsOptions: null,
                    logLevel: 'info',
                }),
            copyPatterns.length > 0 &&
                new CopyWebpackPlugin({
                    patterns: copyPatterns,
                }),
            ,
        ].filter(Boolean),
        watch: true,
        watchOptions: {
            aggregateTimeout: 600,
            ignored: '**/node_modules',
            followSymlinks: true,
        },
    };
};
