const webpack = require('webpack');
const chalk = require('chalk');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const UiExtractPlugin = require('ui-extract-webpack-plugin');
const Dotenv = require('dotenv-webpack');
// const TerserPlugin = require('terser-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OakWeChatMpPlugin = require('../plugins/WechatMpPlugin');

const {
    ROOT,
    SOURCE,
    DESTINATION,
    NODE_ENV,
    PLATFORM_CONFIG,
    ENV_CONFIG,
} = require('./env');
const isDev = NODE_ENV === 'development';

const relativeFileLoader = (ext = '[ext]') => {
    return {
        loader: 'file-loader',
        options: {
            useRelativePath: true,
            name: `[path][name].${ext}`,
            context: SOURCE,
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
                const outputPath = url.split(
                    'oak-general-business/wechatMp/'
                )[1];
                return outputPath;
            },
            context: SOURCE,
        },
    };
};

module.exports = {
    context: SOURCE,
    devtool: isDev ? 'source-map' : false,
    mode: NODE_ENV,
    target: 'web',
    entry: {
        app: '../src/app',
    },
    output: {
        filename: '[name].js',
        path: DESTINATION,
        publicPath: '/',
        globalObject: 'global',
    },
    resolve: {
        alias: {
            '@': SOURCE,
            assert: require.resolve('assert'),
        },
        extensions: ['.ts', '.js', 'json'],
        symlinks: true,
        fallback: {
            crypto: require.resolve('crypto-browserify'),
        },
    },
    resolveLoader: {
        // 第一种使用别名的方式引入自定义的loader
        alias: {
            'wxml-loader': path.resolve(__dirname, 'loaders/wxml-loader.js'),
        },
        // 第二种方式选查找自己的loaders文件中有没有这个loader再查找node_modules文件
        // modules: [path.resolve(__dirname, 'loaders'), 'node_modules'],
    },
    // optimization: {
    //     // 标记未被使用的代码
    //     usedExports: true,
    //     // 删除 usedExports 标记的未使用的代码
    //     minimize: true,
    //     minimizer: [
    //         new TerserPlugin({
    //             extractComments: false,
    //         }),
    //     ],
    // },
    module: {
        rules: [
            {
                test: /\.less$/,
                include: /src/,
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
                include: /oak-general-business\/wechatMp|oak-general-business\\wechatMp/,
                type: 'javascript/auto',
                use: [
                    oakFileLoader('wxss'),
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: () => {
                                const oakConfigJson = require(`${SOURCE}/oak.config.json`);
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
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
            // {
            //     test: /\.json$/,
            //     include: /src/,
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
                include: /src/,
                // type: 'asset/resource',
                // generator: {
                //     filename: `[path][name].[ext]`,
                // },
                type: 'javascript/auto',
                use: [
                    relativeFileLoader('wxml'),
                    {
                        loader: 'wxml-loader',
                    },
                ],
            },
            {
                test: /\.(xml|wxml)$/,
                include: /oak-general-business\/wechatMp|oak-general-business\\wechatMp/,
                type: 'javascript/auto',
                use: [
                    oakFileLoader('wxml'),
                    {
                        loader: 'wxml-loader',
                        options: {},
                    },
                ],
            },
        ],
    },
    plugins: [
        // new CleanWebpackPlugin(),
        new UiExtractPlugin({ context: SOURCE }),
        new OakWeChatMpPlugin({
            exclude: ['*/weui-miniprogram/*'],
            include: ['project.config.json', 'sitemap.json'],
        }),
        new webpack.DefinePlugin({
            __DEV__: isDev,
            __WECHAT__: true,
            ['process.env.NODE_ENV']: JSON.stringify(NODE_ENV),
        }),
        // new MiniCssExtractPlugin({ filename: `[name]${PLATFORM_CONFIG[yamlConfig.platform].style}` }),
        new StylelintPlugin({
            fix: true,
            files: '**/*.(sa|sc|le|wx|c)ss',
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
        new Dotenv({ path: ENV_CONFIG, silent: true }),
    ],
    watch: true,
    watchOptions: {
        aggregateTimeout: 600,
        ignored: '**/node_modules',
        followSymlinks: true,
    },
};
