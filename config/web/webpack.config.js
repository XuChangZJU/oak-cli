'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const ESLintPlugin = require('eslint-webpack-plugin');
const paths = require('./paths');
const modules = require('./modules');
const getClientEnvironment = require('./env');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin =
    process.env.TSC_COMPILE_ON_ERROR === 'true'
        ? require('./../../plugins/ForkTsCheckerWarningWebpackPlugin')
        : require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionWebpackPlugin = require('compression-webpack-plugin');

const createEnvironmentHash = require('./webpack/persistentCache/createEnvironmentHash');

const oakPathTsxPlugin = require('../babel-plugin/oakPath');
const oakRenderTsxPlugin = require('../babel-plugin/oakRender');
// const oakRouterPlugin = require('../babel-plugin/oakRouter2');
const oakI18nPlugin = require('../babel-plugin/oakI18n');
const oakStylePlugin = require('../babel-plugin/oakStyle');
const oakRpxToPxPlugin = require('../postcss-plugin/oakRpxToPx');

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const memoryLimit = process.env.MEMORY_LIMIT ? Number(process.env.MEMORY_LIMIT) : 4096;

const reactRefreshRuntimeEntry = require.resolve('react-refresh/runtime');
const reactRefreshWebpackPluginRuntimeEntry = require.resolve(
    '@pmmmwh/react-refresh-webpack-plugin'
);
const babelRuntimeEntry = require.resolve('babel-preset-react-app');
const babelRuntimeEntryHelpers = require.resolve(
    '@babel/runtime/helpers/esm/assertThisInitialized',
    { paths: [babelRuntimeEntry] }
);
const babelRuntimeRegenerator = require.resolve('@babel/runtime/regenerator', {
    paths: [babelRuntimeEntry],
});

// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';
const shouldAnalyze = process.env.COMPILE_ANALYZE === 'true';

const emitErrorsAsWarnings = process.env.ESLINT_NO_DEV_ERRORS === 'true';
const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === 'true';

const imageInlineSizeLimit = parseInt(
    process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);

// Check if Tailwind config exists
const useTailwind = fs.existsSync(
    path.join(paths.appPath, 'tailwind.config.js')
);

// Get the path to the uncompiled service worker (if it exists).
const swSrc = paths.swSrc;

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const hasJsxRuntime = (() => {
    if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
        return false;
    }

    try {
        require.resolve('react/jsx-runtime');
        return true;
    } catch (e) {
        return false;
    }
})();

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = function (webpackEnv) {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';

    // Variable used for enabling profiling in Production
    // passed into alias object. Uses a flag if passed into the build command
    const isEnvProductionProfile =
        isEnvProduction && process.argv.includes('--profile');

    // We will provide `paths.publicUrlOrPath` to our app
    // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
    // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
    // Get environment variables to inject into our app.
    const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

    const shouldUseReactRefresh = env.raw.FAST_REFRESH;


    // common function to get style loaders
    const getStyleLoaders = (cssOptions, preProcessor, preProcessOptions) => {
        const loaders = [
            isEnvDevelopment && require.resolve('style-loader'),
            isEnvProduction && {
                loader: MiniCssExtractPlugin.loader,
                // css is located in `static/css`, use '../../' to locate index.html folder
                // in production `paths.publicUrlOrPath` can be a relative path
                options: paths.publicUrlOrPath.startsWith('.')
                    ? { publicPath: '../../' }
                    : {},
            },
            {
                loader: require.resolve('css-loader'),
                options: cssOptions,
            },
            {
                // Options for PostCSS as we reference these options twice
                // Adds vendor prefixing based on your specified browser support in
                // package.json
                loader: require.resolve('postcss-loader'),
                options: {
                    postcssOptions: {
                        // Necessary for external CSS imports to work
                        // https://github.com/facebook/create-react-app/issues/2677
                        ident: 'postcss',
                        config: false,
                        plugins: !useTailwind
                            ? [
                                'postcss-flexbugs-fixes',
                                [
                                    'postcss-preset-env',
                                    {
                                        autoprefixer: {
                                            flexbox: 'no-2009',
                                        },
                                        stage: 3,
                                    },
                                ],
                                // Adds PostCSS Normalize as the reset css with default options,
                                // so that it honors browserslist config in package.json
                                // which in turn let's users customize the target behavior as per their needs.
                                'postcss-normalize',
                            ]
                            : [
                                'tailwindcss',
                                'postcss-flexbugs-fixes',
                                [
                                    'postcss-preset-env',
                                    {
                                        autoprefixer: {
                                            flexbox: 'no-2009',
                                        },
                                        stage: 3,
                                    },
                                ],
                            ],
                    },
                    sourceMap: isEnvProduction
                        ? shouldUseSourceMap
                        : isEnvDevelopment,
                },
            },
        ].filter(Boolean);
        if (preProcessor) {
            loaders.push(
                {
                    loader: require.resolve('resolve-url-loader'),
                    options: {
                        sourceMap: isEnvProduction
                            ? shouldUseSourceMap
                            : isEnvDevelopment,
                        root: paths.appRootSrc,
                    },
                },
                {
                    loader: require.resolve(preProcessor),
                    options: Object.assign({
                        sourceMap: true,
                    }, preProcessOptions),
                }
            );
        }
        return loaders;
    };

    // 读取编译配置
    const compilerConfigurationFile = path.join(paths.appRootPath, 'configuration', 'compiler.js');
    const projectConfiguration = fs.existsSync(compilerConfigurationFile) && require(compilerConfigurationFile).webpack;

    const getOakInclude = () => {
        const result = [
            /oak-frontend-base/,
            /oak-general-business/,
        ];
        if (projectConfiguration && projectConfiguration.extraOakModules) {
            result.push(...projectConfiguration.extraOakModules);
        }

        return result;
    };

    return {
        target: ['browserslist'],
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
        // These are the "entry points" to our application.
        // This means they will be the "root" imports that are included in JS bundle.
        entry: paths.appIndexJs,
        output: {
            // The build folder.
            path: paths.appBuild,
            // Add /* filename */ comments to generated require()s in the output.
            pathinfo: isEnvDevelopment,
            // There will be one main bundle, and one file per asynchronous chunk.
            // In development, it does not produce real files.
            filename: isEnvProduction
                ? 'static/js/[name].[contenthash:8].js'
                : isEnvDevelopment && 'static/js/bundle.js',
            // There are also additional JS chunk files if you use code splitting.
            chunkFilename: isEnvProduction
                ? 'static/js/[name].[contenthash:8].chunk.js'
                : isEnvDevelopment && 'static/js/[name].chunk.js',
            assetModuleFilename: 'static/media/[name].[hash][ext]',
            // webpack uses `publicPath` to determine where the app is being served from.
            // It requires a trailing slash, or the file assets will get an incorrect path.
            // We inferred the "public path" (such as / or /my-project) from homepage.
            publicPath: paths.publicUrlOrPath,
            // Point sourcemap entries to original disk location (format as URL on Windows)
            devtoolModuleFilenameTemplate: isEnvProduction
                ? (info) =>
                    path
                        .relative(paths.appSrc, info.absoluteResourcePath)
                        .replace(/\\/g, '/')
                : isEnvDevelopment &&
                ((info) =>
                    path
                        .resolve(info.absoluteResourcePath)
                        .replace(/\\/g, '/')),
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
            minimize: isEnvProduction,
            minimizer: [
                // This is only used in production mode
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            // We want terser to parse ecma 8 code. However, we don't want it
                            // to apply any minification steps that turns valid ecma 5 code
                            // into invalid ecma 5 code. This is why the 'compress' and 'output'
                            // sections only apply transformations that are ecma 5 safe
                            // https://github.com/facebook/create-react-app/pull/4234
                            ecma: 8,
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            // Disabled because of an issue with Uglify breaking seemingly valid code:
                            // https://github.com/facebook/create-react-app/issues/2376
                            // Pending further investigation:
                            // https://github.com/mishoo/UglifyJS2/issues/2011
                            comparisons: false,
                            // Disabled because of an issue with Terser breaking valid code:
                            // https://github.com/facebook/create-react-app/issues/5250
                            // Pending further investigation:
                            // https://github.com/terser-js/terser/issues/120
                            inline: 2,
                        },
                        mangle: {
                            safari10: true,
                        },
                        // Added for profiling in devtools
                        keep_classnames: isEnvProductionProfile,
                        keep_fnames: isEnvProductionProfile,
                        output: {
                            ecma: 5,
                            comments: false,
                            // Turned on because emoji and regex is not minified properly using default
                            // https://github.com/facebook/create-react-app/issues/2488
                            ascii_only: true,
                        },
                    },
                }),
                // This is only used in production mode
                new CssMinimizerPlugin(),
            ],
            splitChunks: {
                chunks: 'async',
                cacheGroups: {
                    '@wangeditor/basic-modules': {
                        name: 'wangeditor_basic_modules',
                        test: /@wangeditor\/basic-modules/,
                        priority: 30,
                        reuseExistingChunk: true,
                    },
                    icon_park: {
                        name: 'icon_park',
                        test: /@icon-park\/react/,
                        priority: 20,
                        reuseExistingChunk: true,
                    },
                    antd_mobile: {
                        name: 'antd_mobile',
                        test: /antd-mobile/,
                        priority: 20,
                        reuseExistingChunk: true,
                    },
                    antdesign: {
                        name: 'antdesign',
                        test: /antd/,
                        priority: 20,
                        reuseExistingChunk: true,
                    },
                    antdesign_icons: {
                        name: 'antdesign_icons',
                        test: /@ant-design\/icons/,
                        priority: 20,
                        reuseExistingChunk: true,
                    },
                    vendor: {
                        name: 'vendor',
                        test: /node_modules/,
                        priority: 10,
                        reuseExistingChunk: true,
                    },
                },
            },
        },
        resolve: {
            fallback: (() => {
                const defaultFb = {
                    crypto: require.resolve('crypto-browserify'),
                    buffer: require.resolve('safe-buffer'),
                    stream: require.resolve('stream-browserify'),
                    zlib: require.resolve('browserify-zlib'),
                    querystring: require.resolve('querystring-es3'),
                    url: false,
                    path: false,
                    fs: false,
                    net: false,
                    tls: false,
                }
                if (
                    projectConfiguration &&
                    projectConfiguration.resolve &&
                    projectConfiguration.resolve.fallback
                ) {
                    Object.assign(
                        defaultFb,
                        projectConfiguration.resolve.fallback
                    );
                }
                return defaultFb;
            })(),
            // This allows you to set a fallback for where webpack should look for modules.
            // We placed these paths second because we want `node_modules` to "win"
            // if there are any conflicts. This matches Node resolution mechanism.
            // https://github.com/facebook/create-react-app/issues/253
            modules: ['node_modules', paths.appNodeModules].concat(
                modules.additionalModulePaths || []
            ),
            // These are the reasonable defaults supported by the Node ecosystem.
            // We also include JSX as a common component filename extension to support
            // some tools, although we do not recommend using it, see:
            // https://github.com/facebook/create-react-app/issues/290
            // `web` extension prefixes have been added for better support
            // for React Native Web.
            extensions: paths.moduleFileExtensions
                .map((ext) => `.${ext}`)
                .filter((ext) => useTypeScript || !ext.includes('ts')),
            alias: (() => {
                const defaultAlias = {
                    // Support React Native Web
                    // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
                    'react-native': 'react-native-web',
                    // Allows for better profiling with ReactDevTools
                    ...(isEnvProductionProfile && {
                        'react-dom$': 'react-dom/profiling',
                        'scheduler/tracing': 'scheduler/tracing-profiling',
                    }),
                    ...(modules.webpackAliases || {}),
                    'bn.js': require.resolve('bn.js'),
                    assert: require.resolve('browser-assert'),
                };
                if (
                    projectConfiguration &&
                    projectConfiguration.resolve &&
                    projectConfiguration.resolve.alias
                ) {
                    Object.assign(
                        defaultAlias,
                        projectConfiguration.resolve.alias
                    );
                }
                return defaultAlias;
            })(),
            plugins: [
                // Prevents users from importing files from outside of src/ (or node_modules/).
                // This often causes confusion because we only process files within src/ with babel.
                // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
                // please link the files into your node_modules/ and let module-resolution kick in.
                // Make sure your source files are compiled, as they will not be processed in any way.
                // new ModuleScopePlugin(paths.appSrc, [
                //     paths.appPackageJson,
                //     reactRefreshRuntimeEntry,
                //     reactRefreshWebpackPluginRuntimeEntry,
                //     babelRuntimeEntry,
                //     babelRuntimeEntryHelpers,
                //     babelRuntimeRegenerator,
                // ]),
            ],
        },
        resolveLoader: {
            // 第一种使用别名的方式引入自定义的loader
            alias: {
                'tsx-loader': path.resolve(
                    __dirname,
                    '../loaders/tsx-loader.js'
                ),
            },
        },
        module: {
            parser: {
                javascript: {
                    reexportExportsPresence: false,
                    //   exportsPresence: 'error',
                },
            },
            strictExportPresence: true,
            rules: [
                // Handle node_modules packages that contain sourcemaps
                shouldUseSourceMap && {
                    enforce: 'pre',
                    exclude: /@babel(?:\/|\\{1,2})runtime/,
                    test: /\.(js|mjs|jsx|ts|tsx|css)$/,
                    loader: require.resolve('source-map-loader'),
                },
                {
                    // "oneOf" will traverse all following loaders until one will
                    // match the requirements. When no loader matches it will fall
                    // back to the "file" loader at the end of the loader list.
                    oneOf: [
                        // TODO: Merge this config once `image/avif` is in the mime-db
                        // https://github.com/jshttp/mime-db
                        {
                            test: [/\.avif$/],
                            type: 'asset',
                            mimetype: 'image/avif',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: imageInlineSizeLimit,
                                },
                            },
                        },
                        // "url" loader works like "file" loader except that it embeds assets
                        // smaller than specified limit in bytes as data URLs to avoid requests.
                        // A missing `test` is equivalent to a match.
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            type: 'asset',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: imageInlineSizeLimit,
                                },
                            },
                        },
                        {
                            test: /\.svg$/,
                            use: [
                                {
                                    loader: require.resolve('@svgr/webpack'),
                                    options: {
                                        prettier: false,
                                        svgo: false,
                                        svgoConfig: {
                                            plugins: [{ removeViewBox: false }],
                                        },
                                        titleProp: true,
                                        ref: true,
                                    },
                                },
                                {
                                    loader: require.resolve('file-loader'),
                                    options: {
                                        name: 'static/media/[name].[hash].[ext]',
                                    },
                                },
                            ],
                            issuer: {
                                and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
                            },
                        },
                        // Process application JS with Babel.
                        // The preset includes JSX, Flow, TypeScript, and some ESnext features.
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)$/,
                            include: [paths.appRootSrc, paths.appSrc].concat(
                                getOakInclude()
                            ),
                            use: [
                                {
                                    loader: require.resolve('babel-loader'),
                                    options: {
                                        sourceType: 'unambiguous',
                                        customize: require.resolve(
                                            'babel-preset-react-app/webpack-overrides'
                                        ),
                                        presets: [
                                            [
                                                require.resolve(
                                                    'babel-preset-react-app'
                                                ),
                                                {
                                                    runtime: hasJsxRuntime
                                                        ? 'automatic'
                                                        : 'classic',
                                                },
                                            ],
                                        ],

                                        plugins: [
                                            isEnvDevelopment &&
                                            shouldUseReactRefresh &&
                                            require.resolve(
                                                'react-refresh/babel'
                                            ),
                                            oakPathTsxPlugin,
                                            oakRenderTsxPlugin,
                                            // oakRouterPlugin,
                                            oakI18nPlugin,
                                            // [
                                            //     'import',
                                            //     {
                                            //         libraryName:
                                            //             '@icon-park/react',
                                            //         libraryDirectory:
                                            //             'es/icons',
                                            //         camel2DashComponentName: false, // default: true,
                                            //     },
                                            // ],
                                        ].filter(Boolean),
                                        // This is a feature of `babel-loader` for webpack (not Babel itself).
                                        // It enables caching results in ./node_modules/.cache/babel-loader/
                                        // directory for faster rebuilds.
                                        cacheDirectory: false,
                                        // See #6846 for context on why cacheCompression is disabled
                                        cacheCompression: false,
                                        compact: isEnvProduction,
                                    },
                                },
                            ],
                        },
                        // Process any JS outside of the app with Babel.
                        // Unlike the application JS, we only compile the standard ES features.
                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                            loader: require.resolve('babel-loader'),
                            options: {
                                babelrc: false,
                                configFile: false,
                                compact: false,
                                presets: [
                                    [
                                        require.resolve(
                                            'babel-preset-react-app/dependencies'
                                        ),
                                        { helpers: true },
                                    ],
                                ],
                                cacheDirectory: true,
                                // See #6846 for context on why cacheCompression is disabled
                                cacheCompression: false,

                                // Babel sourcemaps are needed for debugging into node_modules
                                // code.  Without the options below, debuggers like VSCode
                                // show incorrect code and set breakpoints on the wrong lines.
                                sourceMaps: shouldUseSourceMap,
                                inputSourceMap: shouldUseSourceMap,
                            },
                        },
                        // "postcss" loader applies autoprefixer to our CSS.
                        // "css" loader resolves paths in CSS and adds assets as dependencies.
                        // "style" loader turns CSS into JS modules that inject <style> tags.
                        // In production, we use MiniCSSExtractPlugin to extract that CSS
                        // to a file, but in development "style" loader enables hot editing
                        // of CSS.
                        // By default we support CSS Modules with the extension .module.css
                        {
                            test: cssRegex,
                            exclude: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: isEnvProduction
                                    ? shouldUseSourceMap
                                    : isEnvDevelopment,
                                modules: {
                                    mode: 'icss',
                                },
                            }),
                            // Don't consider CSS imports dead code even if the
                            // containing package claims to have no side effects.
                            // Remove this when webpack adds a warning or an error for this.
                            // See https://github.com/webpack/webpack/issues/6571
                            sideEffects: true,
                        },
                        // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
                        // using the extension .module.css
                        {
                            test: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: isEnvProduction
                                    ? shouldUseSourceMap
                                    : isEnvDevelopment,
                                modules: {
                                    mode: 'local',
                                    getLocalIdent: getCSSModuleLocalIdent,
                                },
                            }),
                        },
                        // Opt-in support for SASS (using .scss or .sass extensions).
                        // By default we support SASS Modules with the
                        // extensions .module.scss or .module.sass
                        {
                            test: sassRegex,
                            exclude: sassModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction
                                        ? shouldUseSourceMap
                                        : isEnvDevelopment,
                                    modules: {
                                        mode: 'icss',
                                    },
                                },
                                'sass-loader'
                            ),
                            // Don't consider CSS imports dead code even if the
                            // containing package claims to have no side effects.
                            // Remove this when webpack adds a warning or an error for this.
                            // See https://github.com/webpack/webpack/issues/6571
                            sideEffects: true,
                        },
                        // Adds support for CSS Modules, but using SASS
                        // using the extension .module.scss or .module.sass
                        {
                            test: sassModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction
                                        ? shouldUseSourceMap
                                        : isEnvDevelopment,
                                    modules: {
                                        mode: 'local',
                                        getLocalIdent: getCSSModuleLocalIdent,
                                    },
                                },
                                'sass-loader'
                            ),
                        },
                        {
                            test: lessRegex,
                            exclude: lessModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction
                                        ? shouldUseSourceMap
                                        : isEnvDevelopment,
                                    modules: {
                                        mode: 'icss',
                                    },
                                },
                                'less-loader',
                                {
                                    lessOptions: () => {
                                        const oakConfigJson = require(paths.oakConfigJson);
                                        return {
                                            javascriptEnabled: true,
                                            modifyVars: oakConfigJson.theme,
                                        };
                                    },
                                }
                            ),
                            sideEffects: true,
                        },
                        {
                            test: lessModuleRegex,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: isEnvProduction
                                        ? shouldUseSourceMap
                                        : isEnvDevelopment,
                                    modules: {
                                        mode: 'local',
                                        getLocalIdent: getCSSModuleLocalIdent,
                                    },
                                },
                                'less-loader',
                                {
                                    lessOptions: () => {
                                        const oakConfigJson = require(paths.oakConfigJson);
                                        return {
                                            javascriptEnabled: true,
                                            modifyVars: oakConfigJson.theme,
                                        };
                                    },
                                }
                            ),
                        },
                        // "file" loader makes sure those assets get served by WebpackDevServer.
                        // When you `import` an asset, you get its (virtual) filename.
                        // In production, they would get copied to the `build` folder.
                        // This loader doesn't use a "test" so it will catch all modules
                        // that fall through the other loaders.
                        {
                            // Exclude `js` files to keep "css" loader working as it injects
                            // its runtime that would otherwise be processed through "file" loader.
                            // Also exclude `html` and `json` extensions so they get processed
                            // by webpacks internal loaders.
                            exclude: [
                                /^$/,
                                /\.(js|mjs|jsx|ts|tsx)$/,
                                /\.html$/,
                                /\.json$/,
                            ],
                            type: 'asset/resource',
                        },
                        // ** STOP ** Are you adding a new loader?
                        // Make sure to add the new loader(s) before the "file" loader.
                    ],
                },
            ].filter(Boolean),
        },
        plugins: [
            isEnvProduction &&
            new CompressionWebpackPlugin({
                filename: '[path][base].gz', //压缩后的文件名
                algorithm: 'gzip', //压缩格式 有：gzip、brotliCompress
                test: /\.(js|css|svg)$/,
                threshold: 10240, // 只处理比这个值大的资源，按字节算
                minRatio: 0.8, //只有压缩率比这个值小的文件才会被处理，压缩率=压缩大小/原始大小，如果压缩后和原始文件大小没有太大区别，就不用压缩
                deleteOriginalAssets: false, //是否删除原文件，最好不删除，服务器会自动优先返回同名的.gzip资源，如果找不到还可以拿原始文件
            }),
            // Generates an `index.html` file with the <script> injected.
            new HtmlWebpackPlugin(
                Object.assign(
                    {},
                    {
                        inject: true,
                        template: paths.appHtml,
                    },
                    isEnvProduction
                        ? {
                            minify: {
                                removeComments: true,
                                collapseWhitespace: true,
                                removeRedundantAttributes: true,
                                useShortDoctype: true,
                                removeEmptyAttributes: true,
                                removeStyleLinkTypeAttributes: true,
                                keepClosingSlash: true,
                                minifyJS: true,
                                minifyCSS: true,
                                minifyURLs: true,
                            },
                        }
                        : undefined
                )
            ),
            // Inlines the webpack runtime script. This script is too small to warrant
            // a network request.
            // https://github.com/facebook/create-react-app/issues/5358
            isEnvProduction &&
            shouldInlineRuntimeChunk &&
            new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [
                /runtime-.+[.]js/,
            ]),
            // Makes some environment variables available in index.html.
            // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
            // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
            // It will be an empty string unless you specify "homepage"
            // in `package.json`, in which case it will be the pathname of that URL.
            new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
            // This gives some necessary context to module not found errors, such as
            // the requesting resource.
            new ModuleNotFoundPlugin(paths.appPath),
            // Makes some environment variables available to the JS code, for example:
            // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
            // It is absolutely essential that NODE_ENV is set to production
            // during a production build.
            // Otherwise React will be compiled in the very slow development mode.
            new webpack.DefinePlugin(env.stringified),
            // Experimental hot reloading for React .
            // https://github.com/facebook/react/tree/main/packages/react-refresh
            isEnvDevelopment &&
            shouldUseReactRefresh &&
            new ReactRefreshWebpackPlugin({
                overlay: false,
            }),
            // Watcher doesn't work well if you mistype casing in a path so we use
            // a plugin that prints an error when you attempt to do this.
            // See https://github.com/facebook/create-react-app/issues/240
            isEnvDevelopment && new CaseSensitivePathsPlugin(),
            isEnvProduction &&
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename:
                    'static/css/[name].[contenthash:8].chunk.css',
            }),
            // Generate an asset manifest file with the following content:
            // - "files" key: Mapping of all asset filenames to their corresponding
            //   output file so that tools can pick it up without having to parse
            //   `index.html`
            // - "entrypoints" key: Array of files which are included in `index.html`,
            //   can be used to reconstruct the HTML if necessary
            new WebpackManifestPlugin({
                fileName: 'asset-manifest.json',
                publicPath: paths.publicUrlOrPath,
                generate: (seed, files, entrypoints) => {
                    const manifestFiles = files.reduce((manifest, file) => {
                        manifest[file.name] = file.path;
                        return manifest;
                    }, seed);
                    const entrypointFiles = entrypoints.main.filter(
                        (fileName) => !fileName.endsWith('.map')
                    );

                    return {
                        files: manifestFiles,
                        entrypoints: entrypointFiles,
                    };
                },
            }),
            // Moment.js is an extremely popular library that bundles large locale files
            // by default due to how webpack interprets its code. This is a practical
            // solution that requires the user to opt into importing specific locales.
            // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
            // You can remove this if you don't use Moment.js:
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/,
            }),
            // Generate a service worker script that will precache, and keep up to date,
            // the HTML & assets that are part of the webpack build.
            isEnvProduction &&
            fs.existsSync(swSrc) &&
            new WorkboxWebpackPlugin.InjectManifest({
                swSrc,
                dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
                exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
                // Bump up the default maximum size (2mb) that's precached,
                // to make lazy-loading failure scenarios less likely.
                // See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
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
                        syntactic: true,
                    },
                    mode: 'write-references',
                    // profile: true,
                    memoryLimit,
                },
                issue: {
                    // This one is specifically to match during CI tests,
                    // as micromatch doesn't match
                    // '../cra-template-typescript/template/src/App.tsx'
                    // otherwise.
                    include: [
                        { file: '../**/app/**/*.{ts,tsx}' },
                        { file: '**/app/**/*.{ts,tsx}' },
                        { file: '../**/app/**/*.*.{ts,tsx}' },
                        { file: '**/app/**/*.*.{ts,tsx}' },
                        { file: '../**/src/**/*.{ts,tsx}' },
                        { file: '**/src/**/*.{ts,tsx}' },
                        { file: '../**/src/**/*.*.{ts,tsx}' },
                        { file: '**/src/**/*.*.{ts,tsx}' },
                    ],
                    exclude: [
                        { file: '**/src/**/__tests__/**' },
                        { file: '**/src/**/?(*.){spec|test}.*' },
                        { file: '**/src/setupProxy.*' },
                        { file: '**/src/setupTests.*' },
                    ],
                },
                logger: {
                    log: (message) => console.log(message),
                    error: (message) => console.error(message),
                },
            }),
            !disableESLintPlugin &&
            new ESLintPlugin({
                // Plugin options
                extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
                formatter: require.resolve(
                    'react-dev-utils/eslintFormatter'
                ),
                eslintPath: require.resolve('eslint'),
                failOnError: !(isEnvDevelopment && emitErrorsAsWarnings),
                context: paths.appSrc,
                cache: true,
                cacheLocation: path.resolve(
                    paths.appNodeModules,
                    '.cache/.eslintcache'
                ),
                // ESLint class options
                cwd: paths.appPath,
                resolvePluginsRelativeTo: __dirname,
                baseConfig: {
                    extends: [
                        require.resolve('eslint-config-react-app/base'),
                    ],
                    rules: {
                        ...(!hasJsxRuntime && {
                            'react/react-in-jsx-scope': 'error',
                        }),
                    },
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
        ].filter(Boolean),
        // Turn off performance processing because we utilize
        // our own hints via the FileSizeReporter
        performance: false,
        externals: {
            echarts: 'echarts',
            lodash: '_',
            react: 'React',
            'react-dom': 'ReactDOM',
            '@wangeditor/editor': 'wangEditor',
            // '@wangeditor/basic-modules': 'WangEditorBasicModules',       这里跑起来初始化会有个BUG，先不弄了
            '@fingerprintjs/fingerprintjs': 'FingerprintJS',
            'bn.js': 'BN',
        },
    };
};
