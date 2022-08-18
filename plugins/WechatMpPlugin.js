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

const pluginName = 'OakWeChatMpPlugin';
const oakRegex = /(^@)(?!project)([a-zA-Z0-9_-])+\/{1}/i;
const oakPageRegex = /node_modules\/[a-zA-Z0-9_-]+\/lib\//;
const localRegex = /^@project\/{1}/i;
const localPageRegex = /[a-zA-Z0-9_-]*src\//;

const MODE = {
    local: 'local', // 引用根目录src的pages
    oak: 'oak', // 引用oak公用库
    external: 'external', // 引用node_modules里面的库
};

function getIsOak(str) {
    return oakRegex.test(str);
}

function replaceOakPrefix(str) {
    return str.replace(oakRegex, '');
}

function getOakPrefix(str) {
    return str.match(oakRegex)[0];
}

function getProjectName(str) {
    const prefix = getOakPrefix(str);
    return prefix.match(/[a-zA-Z0-9_-]+/)[0];
}

function getOakPage(page) {
    const name = getProjectName(page); //截取项目名
    const oakPage = `node_modules/${name}/lib/` + replaceOakPrefix(page);
    return oakPage;
}

function getIsLocal(str) {
    return localRegex.test(str);
}

function replaceLocalPrefix(str) {
    return str.replace(localRegex, '');
}

function getLocalPage(page) {
    const localPage = 'src/' + replaceLocalPrefix(page);
    return localPage;
}

function replaceDoubleSlash(str) {
    return str.replace(/\\/g, '/');
}

class OakWeChatMpPlugin {
    constructor(options = {}) {
        this.options = Object.assign(
            {
                context: path.resolve(process.cwd(), 'src'),
                clear: true,
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

        const catchError = (handler) => async (arg) => {
            try {
                await handler(arg);
            } catch (err) {
                console.warn(err);
            }
        };
        this.firstClean = false;

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
                        // console.log(filename)
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
        this.oakPages = new Set();
        this.oakComponents = new Set();
        this.localPages = new Set();
        this.localComponents = new Set();
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
        let realPages = []; //真正页面
        this.subpackRoot = [];

        for (const { iconPath, selectedIconPath } of tabBar.list || []) {
            if (iconPath) {
                tabBarAssets.add(iconPath);
            }
            if (selectedIconPath) {
                tabBarAssets.add(selectedIconPath);
            }
        }

        // parse subpage
        for (const subPage of subpackages) {
            subPageRoots.push(subPage.root);
            if (subPage.independent) {
                independentPageRoots.push(subPage.root);
            }
            for (const page of subPage.pages || []) {
                realPages.push(path.join(subPage.root, page));
            }
        }

        // add app.[ts/js]
        realPages.push('app');
        // app.json 配置全局usingComponents
        await this.getComponents(components, path.join(this.basePath, 'app'));
        // resolve page components
        for (const page of pages) {
            if (getIsOak(page)) {
                const oakPage = getOakPage(page);
                const instance = path.resolve(process.cwd(), oakPage);
                if (!this.oakPages.has(oakPage)) {
                    this.oakPages.add(oakPage);
                    realPages.push(oakPage);
                }
                await this.getComponents(components, instance, MODE.oak);
            } else if (getIsLocal(page)) {
                const localPage = getLocalPage(page);
                const instance = path.resolve(process.cwd(), localPage);
                if (!this.localPages.has(localPage)) {
                    this.localPages.add(localPage);
                    realPages.push(localPage);
                }
                await this.getComponents(components, instance, MODE.local);
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
    async getComponents(components, instance, mode) {
        try {
            const { usingComponents = {} } = fsExtra.readJSONSync(
                `${instance}.json`
            );
            const instanceDir = path.parse(instance).dir;

            const getModeComponents = async (
                instance,
                c,
                thisComponents,
                mode
            ) => {
                const component = replaceDoubleSlash(path.resolve(instance, c));
                if (component.indexOf(this.basePath) !== -1) {
                    // wechatMp项目下
                    if (!components.has(component)) {
                        const component2 = replaceDoubleSlash(
                            path.relative(this.basePath, component)
                        );
                        if (!components.has(component2)) {
                            components.add(component2);
                            await this.getComponents(components, component);
                        }
                    }
                } else {
                    const component2 = component.replace(
                        replaceDoubleSlash(process.cwd()) + '/',
                        ''
                    );
                    if (!thisComponents.has(component2)) {
                        thisComponents.add(component2);
                        components.add(component2);
                        await this.getComponents(
                            components,
                            path.resolve(process.cwd(), component2),
                            mode
                        );
                    }
                }
            };

            for (const k of Object.keys(usingComponents)) {
                const c = usingComponents[k];
                if (c.indexOf('plugin://') === 0) {
                    continue;
                }
                if (k === this.options.debugPanel.name && !this.options.debugPanel.show) {
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
                        this.getComponents(
                            components,
                            path.resolve(process.cwd(), component),
                            MODE.external
                        );
                    }
                    continue;
                }
                if (getIsOak(c)) {
                    const component = getOakPage(c);
                    const component2 = replaceDoubleSlash(component);
                    if (!this.oakComponents.has(component2)) {
                        this.oakComponents.add(component2);
                        components.add(component2);
                        await this.getComponents(
                            components,
                            path.resolve(process.cwd(), component2),
                            MODE.oak
                        );
                    }
                    continue;
                }
                if (getIsLocal(c)) {
                    const component = getLocalPage(c);
                    const component2 = replaceDoubleSlash(component);
                    if (!this.localComponents.has(component2)) {
                        this.localComponents.add(component2);
                        components.add(component2);
                        await this.getComponents(
                            components,
                            path.resolve(process.cwd(), component2),
                            MODE.local
                        );
                    }
                    continue;
                }
                if (mode === MODE.oak) {
                    await getModeComponents(
                        instanceDir,
                        c,
                        this.oakComponents,
                        mode
                    );
                } else if (mode === MODE.external) {
                    await getModeComponents(
                        instanceDir,
                        c,
                        this.npmComponents,
                        mode
                    );
                } else if (mode === MODE.local) {
                    await getModeComponents(
                        instanceDir,
                        c,
                        this.localComponents,
                        mode
                    );
                } else {
                    // wechatMp项目下
                    const component = replaceDoubleSlash(
                        path.resolve(instanceDir, c)
                    );
                    if (!components.has(component)) {
                        //  components.add(path.relative(this.basePath, component));
                        //  await this.getComponents(components, component);
                        const component2 = replaceDoubleSlash(
                            path.relative(this.basePath, component)
                        );
                        if (!components.has(component2)) {
                            components.add(component2);
                            await this.getComponents(components, component);
                        }
                    }
                }
            }
        } catch (error) {}
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
                } else if (this.oakPages.has(resource)) {
                    new EntryPlugin(
                        this.basePath,
                        path.join(process.cwd(), resource),
                        resource.replace(oakPageRegex, '')
                    ).apply(compiler);
                } else if (this.oakComponents.has(resource)) {
                    new EntryPlugin(
                        this.basePath,
                        path.join(process.cwd(), resource),
                        resource.replace(oakPageRegex, '')
                    ).apply(compiler);
                } else if (this.localPages.has(resource)) {
                    new EntryPlugin(
                        this.basePath,
                        path.join(process.cwd(), resource),
                        resource.replace(localPageRegex, '')
                    ).apply(compiler);
                } else if (this.localComponents.has(resource)) {
                    new EntryPlugin(
                        this.basePath,
                        path.join(process.cwd(), resource),
                        resource.replace(localPageRegex, '')
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
            });
    }

    // add assets entry
    async addAssetsEntries(compiler) {
        const { include, exclude, extensions, assetsChunkName } = this.options;
        const patterns = this.appEntries
            .map((resource) => `${resource}.*`)
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

        const oakPageAssetsEntry = await globby(
            [...this.oakPages].map(
                (resource) => `${path.parse(resource).dir}/**/*.*`
            ),
            {
                cwd: process.cwd(),
                nodir: true,
                realpath: true,
                ignore: this.getIgnoreExt(),
                dot: false,
            }
        );
        const oakComponentAssetsEntry = await globby(
            [...this.oakComponents].map(
                (resource) => `${path.parse(resource).dir}/**/*.*`
            ),
            {
                cwd: process.cwd(),
                nodir: true,
                realpath: true,
                ignore: this.getIgnoreExt(),
                dot: false,
            }
        );
        this.oakAssetsEntry = [
            ...oakPageAssetsEntry,
            ...oakComponentAssetsEntry,
        ];
        this.oakAssetsEntry.forEach((resource) => {
            new EntryPlugin(
                this.basePath,
                path.resolve(process.cwd(), resource),
                assetsChunkName
            ).apply(compiler);
        });

        const localPageAssetsEntry = await globby(
            [...this.localPages].map(
                (resource) => `${path.parse(resource).dir}/**/*.*`
            ),
            {
                cwd: process.cwd(),
                nodir: true,
                realpath: true,
                ignore: this.getIgnoreExt(),
                dot: false,
            }
        );
        const localComponentAssetsEntry = await globby(
            [...this.localComponents].map(
                (resource) => `${path.parse(resource).dir}/**/*.*`
            ),
            {
                cwd: process.cwd(),
                nodir: true,
                realpath: true,
                ignore: this.getIgnoreExt(),
                dot: false,
            }
        );
        this.localAssetsEntry = [
            ...localPageAssetsEntry,
            ...localComponentAssetsEntry,
        ];
        this.localAssetsEntry.forEach((resource) => {
            new EntryPlugin(
                this.basePath,
                path.resolve(process.cwd(), resource),
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
        const { runtimeChunkName, commonsChunkName, vendorChunkName } =
            this.options;
        const subpackRoots = this.appEntries.subPageRoots;
        const independentPageRoots = this.appEntries.independentPageRoots;

        new optimize.RuntimeChunkPlugin({
            name({ name }) {
                const index = independentPageRoots.findIndex((item) =>
                    name.includes(item)
                );
                if (index !== -1) {
                    return path.join(
                        independentPageRoots[index],
                        runtimeChunkName
                    );
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
                // node_modules
                vendor: {
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/,
                    name: vendorChunkName,
                    minChunks: 0,
                },

                // 其他公用代码
                common: {
                    chunks: 'all',
                    test: /[\\/]src[\\/]/,
                    minChunks: 2,
                    name({ context }) {
                        const index = subpackRoots.findIndex((item) =>
                            context.includes(item)
                        );
                        if (index !== -1) {
                            return path.join(
                                subpackRoots[index],
                                commonsChunkName
                            );
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
        for (let entry of this.oakAssetsEntry) {
            const assets = replaceDoubleSlash(
                path.resolve(process.cwd(), entry)
            );
            if (/\.(sass|scss|css|less|styl|xml|wxml)$/.test(assets)) {
                continue;
            }
            const entry2 = entry.replace(oakPageRegex, '');
            if (!compilation.assets[entry2]) {
                emitAssets.push(
                    this.toTmit(compilation, assets, entry2, MODE.oak)
                );
            }
        }
        for (let entry of this.localAssetsEntry) {
            const assets = replaceDoubleSlash(
                path.resolve(process.cwd(), entry)
            );
            if (/\.(sass|scss|css|less|styl|xml|wxml)$/.test(assets)) {
                continue;
            }
            const entry2 = entry.replace(localPageRegex, '');
            if (!compilation.assets[entry2]) {
                emitAssets.push(
                    this.toTmit(compilation, assets, entry2, MODE.local)
                );
            }
        }
        await Promise.all(emitAssets);
    }

    async toTmit(compilation, assets, entry, mode) {
        const stat = await fsExtra.stat(assets);
        let size = stat.size;
        let source = await fsExtra.readFile(assets);
        if (entry === 'app.json') {
            const appJson = JSON.parse(source.toString());

            let pages = [];
            if (appJson.pages) {
                for (let page of appJson.pages) {
                    if (getIsOak(page)) {
                        page = replaceOakPrefix(page);
                    } else if (getIsLocal(page)) {
                        page = replaceLocalPrefix(page);
                    }
                    pages.push(page);
                }
                appJson.pages = pages;
            }

            let usingComponents = {};
            if (appJson.usingComponents) {
                for (let ck of Object.keys(appJson.usingComponents)) {
                    let component = appJson.usingComponents[ck];
                    if (ck === this.options.debugPanel.name && !this.options.debugPanel.show) {
                        continue;
                    }
                    if (getIsOak(component)) {
                        component = replaceOakPrefix(component);
                    } else if (getIsLocal(component)) {
                        component = replaceLocalPrefix(component);
                    }
                    usingComponents[ck] = component;
                }
                appJson.usingComponents = usingComponents;
            }
            source = Buffer.from(JSON.stringify(appJson, null, 2));
            size = source.length;
        } else if (/\.(json)$/.test(assets)) {
            const json = JSON.parse(source.toString());

            let usingComponents = {};
            if (json.usingComponents) {
                for (let ck of Object.keys(json.usingComponents)) {
                    let component = json.usingComponents[ck];
                    let assets2 = assets;
                    let component2;
                    switch (mode) {
                        case MODE.local: {
                            assets2 = replaceDoubleSlash(
                                path.resolve(this.basePath, entry)
                            );
                            if (getIsOak(component)) {
                                component2 = replaceOakPrefix(component);
                            } else if (getIsLocal(component)) {
                                component2 = replaceLocalPrefix(component);
                            } else {
                                // 如果component是外层src下路径就不处理了
                                if (
                                    replaceDoubleSlash(
                                        path.resolve(
                                            assets.substring(
                                                0,
                                                assets.lastIndexOf('/')
                                            ),
                                            component
                                        )
                                    ).indexOf(
                                        replaceDoubleSlash(
                                            path.resolve(process.cwd(), 'src')
                                        )
                                    ) < 0
                                ) {
                                    component2 = replaceDoubleSlash(
                                        path.relative(
                                            this.basePath,
                                            path.resolve(
                                                assets.substring(
                                                    0,
                                                    assets.lastIndexOf('/')
                                                ),
                                                component
                                            )
                                        )
                                    );
                                }
                            }
                            
                            break;
                        }
                        case MODE.oak: {
                            assets2 = replaceDoubleSlash(
                                path.resolve(this.basePath, entry)
                            );
                            if (getIsOak(component)) {
                                component2 = replaceOakPrefix(component);
                            } else if (getIsLocal(component)) {
                                component2 = replaceLocalPrefix(component);                               
                            }
                            break;
                        }
                        default: {
                            if (getIsOak(component)) {
                                component2 = replaceOakPrefix(component);
                            } else if (getIsLocal(component)) {
                                component2 = replaceLocalPrefix(component);
                            }
                            break;
                        }
                    } 
                    if (component2) {
                        component = replaceDoubleSlash(
                            path.relative(
                                assets2.substring(0, assets2.lastIndexOf('/')),
                                path.resolve(this.basePath, component2)
                            )
                        );
                    } 
                    usingComponents[ck] = component;
                }
                json.usingComponents = usingComponents;
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
}

module.exports = OakWeChatMpPlugin;
