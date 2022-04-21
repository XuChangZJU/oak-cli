const webpack = require('webpack');
const chalk = require('chalk');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const UiExtractPlugin = require('ui-extract-webpack-plugin');
const Dotenv = require('dotenv-webpack');
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
const __DEV__ = NODE_ENV === 'development';

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

const oakLoader = (ext = '[ext]') => {
    return {
        loader: 'file-loader',
        options: {
            useRelativePath: true,
            name: `[path][name].${ext}`,
            outputPath: (url, resourcePath, context) => {
                const outputPath = url.split(
                    'oak-general-business/src/platforms/wechatMp/'
                )[1];
                return outputPath;
            },
            context: SOURCE,
        },
    };
};

module.exports = {
    context: SOURCE,
    devtool: __DEV__ ? 'source-map' : false,
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
                include: /oak-general-business/,
                type: 'javascript/auto',
                use: [
                    oakLoader('wxss'),
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
                type: 'asset/resource',
                generator: {
                    filename: `[path][name].[ext]`,
                },
                // use: [relativeFileLoader('wxml')],
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
        /* new webpack.DefinePlugin({
            ['process.env.NODE_ENV']: JSON.stringify(NODE_ENV),
        }), */
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
