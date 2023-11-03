/**
 * 把目录下所有的.ts和.less文件加入entry
 */
const path = require('path');
const fsExtra = require('fs-extra');
const globby = require('globby');
const { optimize, sources } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const JavascriptModulesPlugin = require('webpack/lib/javascript/JavascriptModulesPlugin');
const EntryPlugin = require('webpack/lib/EntryPlugin');
const ensurePosix = require('ensure-posix-path');
const requiredPath = require('required-path');

const {
    parseSync,
    transformFromAstSync,
    transformSync,
} = require('@babel/core');
const t = require('@babel/types');
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const assert = require('assert');
const traverseAst = require('@babel/traverse').default;

const pluginName = 'OakWeChatMpPlugin';

function replaceDoubleSlash(str) {
    return str.replace(/\\/g, '/');
}

class OakWeChatMpPlugin {
    constructor(options = {}) {
        this.options = Object.assign(
            {
                context: path.resolve(process.cwd(), 'src'),
                extensions: ['.js', '.ts'], // script ext
                include: [], // include assets file
                exclude: [], // ignore assets file
                assetsChunkName: '__assets_chunk__',
                commonsChunkName: 'commons',
                vendorChunkName: 'vendor',
                runtimeChunkName: 'runtime',
                split: true,
                debugPanel: {
                    name: 'oak-debugPanel',
                    show: true,
                },
            },
            options
        );
    }

    apply(compiler) {
        this.setBasePath(compiler);
        this.setAlias(compiler);

        const catchError = (handler) => async (arg) => {
            try {
                await handler(arg);
            } catch (err) {
                console.warn(err);
            }
        };

        compiler.hooks.run.tapPromise(
            pluginName,
            catchError((compiler) => this.setAppEntries(compiler))
        );

        compiler.hooks.watchRun.tapPromise(
            pluginName,
            catchError((compiler) => this.setAppEntries(compiler))
        );

        compiler.hooks.compilation.tap(
            pluginName,
            catchError((compilation) => this.compilationHooks(compilation))
        );

        compiler.hooks.emit.tapPromise(
            pluginName,
            catchError(async (compilation) => {
                // 输出outpath前
            })
        );

        compiler.hooks.afterEmit.tap(
            pluginName,
            (compilation) => {
                const { options, outputOptions } = compilation;
                const { context: projectPath } = options;
                const { path: outputPath } = outputOptions;

                this.makeI18nWxs(projectPath, outputPath);
            }
        );
    }

    compilationHooks(compilation) {
        const { assetsChunkName } = this.options;

        JavascriptModulesPlugin.getCompilationHooks(compilation).render.tap(
            pluginName,
            (source, { chunkGraph, chunk }) => {
                // 非动态入口
                const hasEntryModule =
                    chunkGraph.getNumberOfEntryModules(chunk) > 0;
                if (!hasEntryModule) return source;
                // 收集动态入口所有的依赖
                let dependences = [];
                [...chunk.groupsIterable].forEach((group) => {
                    [...group.chunks].forEach((chunk2) => {
                        const filename = ensurePosix(
                            path.relative(path.dirname(chunk.name), chunk2.name)
                        );
                        if (
                            chunk === chunk2 ||
                            dependences.includes(filename)
                        ) {
                            return;
                        }
                        dependences.push(filename);
                    });
                });
                // 没有依赖
                if (dependences.length == 0) return;
                // 源文件拼接依赖
                const concatStr = dependences.reduce((prev, file) => {
                    prev += `require('${requiredPath(file)}');`;
                    return prev;
                }, ';');
                return new sources.ConcatSource(concatStr, source);
            }
        );

        // splice assets module
        compilation.hooks.beforeChunkAssets.tap(pluginName, () => {
            let assetsChunk;
            compilation.chunks.forEach((chunk) => {
                if (chunk.name === assetsChunkName) {
                    assetsChunk = chunk;
                }
            });
            if (assetsChunk) {
                compilation.chunks.delete(assetsChunk);
            }
        });

        compilation.hooks.processAssets.tapPromise(
            {
                name: pluginName,
                stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
            },
            async (assets) => {
                await this.emitAssetsFile(compilation);
            }
        );
    }

    async setAppEntries(compiler) {
        const { split } = this.options;
        this.npmComponents = new Set();
        this.appEntries = await this.resolveAppEntries(compiler);
        await Promise.all([
            this.addScriptEntry(compiler),
            this.addAssetsEntries(compiler),
        ]);
        if (split) {
            this.applyPlugin(compiler);
        }
    }

    // resolve tabbar page compoments
    async resolveAppEntries(compiler) {
        const {
            tabBar = {},
            pages = [],
            subpackages = [],
        } = fsExtra.readJSONSync(path.join(this.basePath, 'app.json'));

        let tabBarAssets = new Set();
        let components = new Set();
        let subPageRoots = [];
        let independentPageRoots = [];
        let realPages = [];
        this.subpackRoot = [];

        for (const tab of tabBar.list || []) {
            const { iconPath, selectedIconPath, pagePath } = tab;
            if (iconPath) {
                const aliasPath = this.getAliasPath(iconPath);
                tabBarAssets.add(aliasPath);
            }
            if (selectedIconPath) {
                const aliasPath = this.getAliasPath(selectedIconPath);
                tabBarAssets.add(aliasPath);
            }
        }

        // parse subpage
        for (const subPage of subpackages) {
            subPageRoots.push(subPage.root);
            if (subPage.independent) {
                independentPageRoots.push(subPage.root);
            }
            for (const page of subPage.pages || []) {
                pages.push(replaceDoubleSlash(path.join(subPage.root, page)));
            }
        }

        // add app.[ts/js]
        pages.push('app');

        // resolve page components
        for (const page of pages) {
            const aliasPath = this.getAliasPath(page);
            if (aliasPath) {
                realPages.push(aliasPath);
                await this.getComponents(components, aliasPath);
            } else {
                realPages.push(page);
                const instance = path.resolve(this.basePath, page);
                await this.getComponents(components, instance);
            }
        }

        components = Array.from(components) || [];
        tabBarAssets = Array.from(tabBarAssets) || [];

        const ret = [...realPages, ...components];

        Object.defineProperties(ret, {
            pages: {
                get: () => realPages,
            },
            components: {
                get: () => components,
            },
            tabBarAssets: {
                get: () => tabBarAssets,
            },
            subPageRoots: {
                get: () => subPageRoots,
            },
            independentPageRoots: {
                get: () => independentPageRoots,
            },
        });
        return ret;
    }

    // parse components
    async getComponents(components, instance) {
        try {
            const { debugPanel } = this.options;
            const { usingComponents = {} } = fsExtra.readJSONSync(
                `${instance}.json`
            );
            const instanceDir = path.parse(instance).dir;

            for (const k of Object.keys(usingComponents)) {
                const c = usingComponents[k];
                if (c.indexOf('plugin://') === 0) {
                    continue;
                }
                if (k === debugPanel.name && !debugPanel.show) {
                    continue;
                }
                if (c.indexOf('/npm_components') === 0) {
                    const component = c.replace(
                        /\/npm_components/,
                        'node_modules'
                    );
                    if (!this.npmComponents.has(component)) {
                        this.npmComponents.add(component);
                        components.add(component);
                        await this.getComponents(
                            components,
                            path.resolve(process.cwd(), component)
                        );
                    }
                    continue;
                }

                const aliasPath = this.getAliasPath(c);
                if (aliasPath) {
                    if (!components.has(aliasPath)) {
                        components.add(aliasPath);
                        await this.getComponents(components, aliasPath);
                    }
                } else {
                    const component = replaceDoubleSlash(
                        path.resolve(instanceDir, c)
                    );
                    if (!components.has(component)) {
                        const component2 = replaceDoubleSlash(
                            path.resolve(this.basePath, component)
                        );
                        if (!components.has(component2)) {
                            components.add(component2);
                            await this.getComponents(components, component);
                        }
                    }
                }
            }
        } catch (error) { }
    }

    // add script entry
    async addScriptEntry(compiler) {
        this.appEntries
            .filter((resource) => resource !== 'app')
            .forEach((resource) => {
                if (this.npmComponents.has(resource)) {
                    new EntryPlugin(
                        this.basePath,
                        path.join(process.cwd(), resource),
                        resource.replace(/node_modules/, 'npm_components')
                    ).apply(compiler);
                } else {
                    const prefixPath = this.getPrefixPath(resource);
                    if (prefixPath) {
                        new EntryPlugin(
                            this.basePath,
                            resource,
                            resource.replace(`${prefixPath}/`, '')
                        ).apply(compiler);
                    } else {
                        const fullPath = this.getFullScriptPath(resource);
                        if (fullPath) {
                            new EntryPlugin(
                                this.basePath,
                                fullPath,
                                resource
                            ).apply(compiler);
                        } else {
                            console.warn(`file ${resource} is exists`);
                        }
                    }
                }
            });
    }


    // add assets entry
    async addAssetsEntries(compiler) {
        const { include, exclude, extensions, assetsChunkName } = this.options;
        const patterns = this.appEntries
            .map((resource) => {
                if (/[\\/]miniprogram_npm[\\/]/.test(resource)) {
                    return `${path.parse(resource).dir}/**/*.*`;
                }
                return `${resource}.*`
            })
            .concat(include);

        const entries = await globby(patterns, {
            cwd: this.basePath,
            nodir: true,
            realpath: true,
            ignore: this.getIgnoreExt(),
            dot: false,
        });
     
        this.assetsEntry = [...entries, ...this.appEntries.tabBarAssets];
        this.assetsEntry.forEach((resource) => {
            new EntryPlugin(
                this.basePath,
                path.resolve(this.basePath, resource),
                assetsChunkName
            ).apply(compiler);
        });

        const npmAssetsEntry = await globby(
            [...this.npmComponents]
                .map((resource) => `${path.parse(resource).dir}/**/*.*`)
                .concat(include),
            {
                cwd: process.cwd(),
                nodir: true,
                realpath: false,
                ignore: this.getIgnoreExt(),
                dot: false,
            }
        );
        if (npmAssetsEntry.length > 0) {
            new CopyWebpackPlugin({
                patterns: [
                    ...npmAssetsEntry.map((resource) => {
                        return {
                            from: path.resolve(
                                replaceDoubleSlash(process.cwd()),
                                resource
                            ),
                            to: resource.replace(
                                /node_modules/,
                                'npm_components'
                            ),
                            globOptions: {
                                ignore: this.getIgnoreExt(),
                            },
                        };
                    }),
                ],
            }).apply(compiler);
        }
    }

    // code splite
    applyPlugin(compiler) {
        const _this = this;
        const { runtimeChunkName, commonsChunkName, vendorChunkName } =
            this.options;
        const subpackRoots = this.appEntries.subPageRoots;
        const independentPageRoots = this.appEntries.independentPageRoots;

        new optimize.RuntimeChunkPlugin({
            name({ name }) {
                const index = independentPageRoots.findIndex((item) => {
                    const item2 = _this.getReplaceAlias(item);
                    return name.includes(item2);
                });
                if (index !== -1) {
                    const item = independentPageRoots[index];
                    const item2 = _this.getReplaceAlias(item);
                    return path.join(item2, runtimeChunkName);
                }
                return runtimeChunkName;
            },
        }).apply(compiler);

        new optimize.SplitChunksPlugin({
            hidePathInfo: false,
            chunks: 'all',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: Infinity,
            automaticNameDelimiter: '~',
            maxInitialRequests: Infinity,
            name: true,
            cacheGroups: {
                default: false,

                oak_app_domain: {
                    chunks: 'all',
                    test: /[\\/]oak-app-domain[\\/]/,
                    name: 'oak_app_domain',
                    minChunks: 0,
                },

                oak_domain: {
                    chunks: 'all',
                    test: /[\\/]oak-domain[\\/]/,
                    name: 'oak_domain',
                    minChunks: 0,
                },

                oak_external_sdk: {
                    chunks: 'all',
                    test: /[\\/]oak-external-sdk[\\/]/,
                    name: 'oak_external_sdk',
                    minChunks: 0,
                },

                echarts: {
                    chunks: 'all',
                    test: /[\\/]miniprogram_npm\/ec-canvas\/echarts\.js$/,
                    name: 'echarts',
                    minChunks: 0,
                },

                vendor: {
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/,
                    name: vendorChunkName,
                    minChunks: 0,
                    reuseExistingChunk: true,
                },

                // 其他公用代码
                common: {
                    chunks: 'all',
                    test: /[\\/]src[\\/]/,
                    minChunks: 2,
                    name({ context }) {
                        const index = subpackRoots.findIndex((item) => {
                            const item2 = _this.getReplaceAlias(item);
                            return context.includes(item2);
                        });
                        if (index !== -1) {
                            const item = subpackRoots[index];
                            const item2 = _this.getReplaceAlias(item);
                            return path.join(item2, commonsChunkName);
                        }
                        return commonsChunkName;
                    },
                    minSize: 0,
                },
            },
        }).apply(compiler);
    }

    async emitAssetsFile(compilation) {
        const emitAssets = [];
        for (let entry of this.assetsEntry) {
            const prefixPath = this.getPrefixPath(replaceDoubleSlash(entry));

            if (prefixPath) {
                const assets = entry;
                const entry2 = entry.replace(`${prefixPath}/`, '');
                if (/\.(sass|scss|css|less|styl|xml|wxml)$/.test(assets)) {
                    continue;
                }
                if (!compilation.assets[entry2]) {
                    emitAssets.push(this.toTmit(compilation, assets, entry2));
                }
            } else {
                const assets = replaceDoubleSlash(
                    path.resolve(this.basePath, entry)
                );
                if (/\.(sass|scss|css|less|styl|xml|wxml)$/.test(assets)) {
                    continue;
                }
                if (!compilation.assets[entry]) {
                    emitAssets.push(this.toTmit(compilation, assets, entry));
                }
            }
        }

        await Promise.all(emitAssets);
    }

    async toTmit(compilation, assets, entry) {
        const stat = await fsExtra.stat(assets);
        let size = stat.size;
        let source = await fsExtra.readFile(assets);
        if (entry === 'app.json') {
            const { debugPanel } = this.options;
            const appJson = JSON.parse(source.toString());

            let pages = [];
            if (appJson.pages) {
                for (let page of appJson.pages) {
                    page = this.getReplaceAlias(page);
                    pages.push(page);
                }
                appJson.pages = pages;
            }

            if (appJson.tabBar) {
                const list = appJson.tabBar.list;

                for (const tab of list || []) {
                    const { iconPath, selectedIconPath, pagePath } = tab;
                    if (iconPath) {
                        tab.iconPath = this.getReplaceAlias(iconPath);
                    }
                    if (selectedIconPath) {
                        tab.selectedIconPath = this.getReplaceAlias(selectedIconPath);
                    }
                    if (pagePath) {
                        tab.pagePath = this.getReplaceAlias(pagePath);
                    }
                }
            }

            let usingComponents = {};
            if (appJson.usingComponents) {
                for (let ck of Object.keys(appJson.usingComponents)) {
                    let component = appJson.usingComponents[ck];
                    if (ck === debugPanel.name && !debugPanel.show) {
                        continue;
                    }
                    component = this.getReplaceAlias(component);
                    usingComponents[ck] = component;
                }
                appJson.usingComponents = usingComponents;
            }

            if (appJson.subpackages) {
                const subPackages = appJson.subpackages;
                for (const subPage of subPackages) {
                    const root = subPage.root;
                    subPage.root = this.getReplaceAlias(root);
                }
                appJson.subpackages = subPackages;
            }
            source = Buffer.from(JSON.stringify(appJson, null, 2));
            size = source.length;
        } else if (/\.(json)$/.test(assets)) {
            const json = JSON.parse(source.toString());

            let usingComponents = {};
            if (json.usingComponents) {
                for (let ck of Object.keys(json.usingComponents)) {
                    let component = json.usingComponents[ck];

                    const alias = this.getAlias(component);
                    if (alias) {
                        component = this.getReplaceAlias(component);

                        const parentPath = path.resolve(this.basePath, entry);
                        const parentDir = path.parse(parentPath).dir;
                        component = replaceDoubleSlash(
                            path.relative(
                                parentDir,
                                path.resolve(this.basePath, component)
                            )
                        );
                    }
                    usingComponents[ck] = component;
                }
                json.usingComponents = usingComponents;
            }

            // 将locales中的pageTitle复制到小程序中的navigationBarTitleText
            const parsed = path.parse(assets);
            if (parsed.name === 'index') {
                const localeZhCnFile1 = path.join(parsed.dir, 'locales', 'zh-CN.json');
                const localeZhCnFile2 = path.join(parsed.dir, 'locales', 'zh_CN.json');
                if (fsExtra.existsSync(localeZhCnFile1)) {
                    const locales = require(localeZhCnFile1);
                    if (locales.pageTitle) {
                        json.navigationBarTitleText = locales.pageTitle;
                    }
                }
                else if (fsExtra.existsSync(localeZhCnFile2)) {
                    const locales = require(localeZhCnFile2);
                    if (locales.pageTitle) {
                        json.navigationBarTitleText = locales.pageTitle;
                    }
                }
            }

            source = Buffer.from(JSON.stringify(json, null, 2));
            size = source.length;
        }
        compilation.assets[entry] = {
            size: () => size,
            source: () => source,
        };
    }

    setBasePath(compiler) {
        this.basePath = replaceDoubleSlash(this.options.context);
    }

    setAlias(compiler) {
        // 使用别名设置路径
        this.alias = compiler.options.resolve.alias || {};
    }

    getAlias(path) {
        let alias = '';
        // 返回 alias key
        for (const k of Object.keys(this.alias)) {
            if (path.includes(`${k}/`)) {
                alias = k;
                break;
            }
        }
        return alias;
    }

    getReplaceAlias(path) {
        // 处理 @project/xx/xx路径 转换成编译下路径
        const alias = this.getAlias(path);
        let path2 = path;
        if (alias) {
            path2 = path.replace(`${alias}/`, '');
        }
        return path2;
    }

    getAliasPath(path) {
        let aliasPath = '';
        const alias = this.getAlias(path);
        // 处理下别名 返回真实path
        if (alias) {
            aliasPath = replaceDoubleSlash(
                path.replace(alias, this.alias[alias])
            );
        }
        return aliasPath;
    }

    getPrefixPath(resource) {
        let prefixPath = '';
        // 获取路径 别名
        for (const k of Object.keys(this.alias)) {
            const prefix = replaceDoubleSlash(this.alias[k]);
            if (resource.includes(prefix)) {
                prefixPath = prefix;
                break;
            }
        }
        return prefixPath;
    }

    // script full path
    getFullScriptPath(script) {
        const {
            basePath,
            options: { extensions },
        } = this;
        for (const ext of extensions) {
            const fullPath = path.resolve(basePath, script + ext);
            if (fsExtra.existsSync(fullPath)) {
                return fullPath;
            }
        }
    }

    getIgnoreExt() {
        const {
            options: { extensions, exclude },
        } = this;
        return [
            '**/*.tsx',
            ...extensions
                .filter((ext) => ['.js', '.ts'].includes(ext))
                .map((ext) => `**/*${ext}`),
            ...exclude,
        ];
    }

    makeI18nWxs(projectPath, outputPath) {
        const i18nWxsFilename = path.join(
            projectPath,
            'node_modules',
            'oak-frontend-base',
            'lib',
            'platforms',
            'wechatMp',
            'i18n',
            'wxs.js'
        );
        let content = readFileSync(i18nWxsFilename, { encoding: 'utf-8' });
     
        try {
            // Babel 转换配置
            const options = {
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: 'last 2 versions, > 1%',
                        },
                    ],
                ],
                plugins: [
                    '@babel/plugin-transform-arrow-functions',
                    '@babel/plugin-transform-classes',
                    '@babel/plugin-transform-destructuring',
                    '@babel/plugin-transform-spread',
                    // 添加其他需要的插件
                ],
            };

            // 使用 Babel 进行转换
            const result = transformSync(content, options);

            // 返回转换后的 ES5 代码
            content = result.code;
        } catch (error) {
            console.error('转换失败:', error);
        }
        const ast = parseSync(content);
        const {
            program: { body },
        } = ast;

        traverseAst(ast, {
            enter(path) {
                if (path.isRegExpLiteral()) {
                    const { node } = path;
                    path.replaceWith(
                        t.callExpression(t.identifier('getRegExp'), [
                            t.stringLiteral(node.pattern),
                            t.stringLiteral(node.flags),
                        ])
                    );
                } else if (path.isNewExpression()) {
                    const { node } = path;
                    if (
                        t.isIdentifier(node.callee) &&
                        node.callee.name === 'RegExp'
                    ) {
                        const { arguments: args } = node;
                        path.replaceWith(
                            t.callExpression(t.identifier('getRegExp'), args)
                        );
                    }
                }
            },
        });

        /**
         * 去掉编译中不必要的expression
         */
        ast.program.body = ast.program.body.filter(
            (ele) => !t.isExpressionStatement(ele)
        );

        /**
         * 加上module.exports = { t: t };
         */
        ast.program.body.push(
            t.expressionStatement(
                t.assignmentExpression(
                    '=',
                    t.memberExpression(
                        t.identifier('module'),
                        t.identifier('exports')
                    ),
                    t.objectExpression([
                        t.objectProperty(t.identifier('t'), t.identifier('t')),
                        t.objectProperty(
                            t.identifier('propObserver'),
                            t.identifier('propObserver')
                        ),
                    ])
                )
            )
        );

        const { code } = transformFromAstSync(ast);

        const wxsOutputDir = path.join(outputPath, 'wxs');
        if (!existsSync(wxsOutputDir)) {
            mkdirSync(wxsOutputDir);
        }
        const outputFilename = path.join(wxsOutputDir, 'i18n.wxs');
        writeFileSync(outputFilename, code, { flag: 'w' });
    }
}

module.exports = OakWeChatMpPlugin;
