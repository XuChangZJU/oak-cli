const fs = require('fs');
const { relative, join, resolve, parse } = require('path');
const t = require('@babel/types');
const assert = require('assert');
const AppPaths = require('../web/paths');
const { parseSync, transformFromAstSync } = require('@babel/core');
const NodeWatch = require('node-watch');
const cloneDeep = require('lodash/cloneDeep');
const { unset } = require('lodash');

const pageFiles = {};
const routerFiles = {};

/**
 * 对nss所标识出的namespace下的(pages文件下的)文件，一旦有变更就重编译filename
 * @param {*} filename 
 * @param {*} nss 
 */
function addFileWatcher(filename, nss) {
    if (process.env.NODE_ENV === 'development') {
        nss.forEach(
            (ns) => {
                if (routerFiles[ns]) {
                    routerFiles[ns].push(filename);
                }
                else {
                    routerFiles[ns] = [filename];
                    const pageSrcDir = join(AppPaths.appRootSrc, 'pages', ns);

                    NodeWatch(pageSrcDir, { recursive: true }, (evt, name) => {
                        const { dir } = parse(name);
                        const indexJsonFile = join(dir, 'index.json');
                        const indexTsxFile = join(dir, 'index.tsx');
                        const webTsxFile = join(dir, 'web.tsx');
                        const webPcTsxFile = join(dir, 'web.pc.tsx');
                        if (evt === 'update' && !pageFiles[ns].hasOwnProperty(dir)) {
                            // 处理新增文件事件，删除事件webpack会自己处理，不处理也没什么问题
                            if (fs.existsSync(indexTsxFile) || fs.existsSync(webTsxFile) || fs.existsSync(webPcTsxFile)) {
                                let oakDisablePulldownRefresh = false;
                                if (fs.existsSync(indexJsonFile)) {
                                    const {
                                        enablePullDownRefresh = true,
                                    } = require(indexJsonFile);
                                    oakDisablePulldownRefresh = !enablePullDownRefresh;
                                }
                                const relativePath = relative(pageSrcDir, dir);
                                const newPageItem = {
                                    path: relativePath.replace(/\\/g, '/'),
                                    oakDisablePulldownRefresh,
                                };
                                pageFiles[ns][dir] = newPageItem;

                                const now = new Date();
                                routerFiles[ns].forEach(
                                    (file) => fs.utimes(file, now, now, () => undefined)
                                );
                            }
                        }
                        else if (evt === 'remove' && pageFiles.hasOwnProperty(dir)) {
                            if (!(fs.existsSync(indexTsxFile) || fs.existsSync(webTsxFile) || fs.existsSync(webPcTsxFile))) {
                                unset(pageFiles[ns], dir);

                                const now = new Date();
                                routerFiles[ns].forEach(
                                    (file) => fs.utimes(file, now, now, () => undefined)
                                );
                            }
                        }
                    });
                }
            }
        )
    }
}

function makeRouterItem(page, ns, namespacePath, first) {
    const { path, oakDisablePulldownRefresh } = page;
    return t.objectExpression(
        [
            t.objectProperty(
                t.identifier('path'),
                t.stringLiteral(path)
            ),
            t.objectProperty(
                t.identifier('namespace'),
                t.stringLiteral(namespacePath),
            ),
            t.objectProperty(
                t.identifier('meta'),
                t.objectExpression(
                    [
                        t.objectProperty(
                            t.identifier('oakDisablePulldownRefresh'),
                            t.booleanLiteral(oakDisablePulldownRefresh)
                        ),
                    ]
                )
            ),
            t.objectProperty(
                t.identifier('Component'),
                t.callExpression(
                    t.memberExpression(t.identifier('React'), t.identifier('lazy')),
                    [
                        t.arrowFunctionExpression(
                            [],
                            t.callExpression(t.import(), [
                                t.stringLiteral(join('@project', 'pages', ns, path, 'index').replace(/\\/g, '/'))
                            ])
                        ),
                    ]
                )
            ),
            t.objectProperty(
                t.identifier('isFirst'),
                t.booleanLiteral(first === path)
            )
        ]
    );
}

function traversePages(nss) {
    // pages从相应目录遍历获得
    nss.forEach(
        (ns) => {
            if (!pageFiles.hasOwnProperty(ns)) {
                pageFiles[ns] = {};
                const pageSrcDir = join(AppPaths.appRootSrc, 'pages', ns);

                const traverse = (dir, relativePath) => {
                    const files = fs.readdirSync(dir);
                    files.forEach(
                        (file) => {
                            const filepath = join(dir, file);
                            const stat = fs.statSync(filepath);
                            if (stat.isFile() && ['index.tsx', 'web.tsx', 'web.pc.tsx'].includes(file) && !pageFiles[ns].hasOwnProperty(dir)) {
                                const indexJsonFile = join(dir, 'index.json');
                                let oakDisablePulldownRefresh = false;
                                if (fs.existsSync(indexJsonFile)) {
                                    const {
                                        enablePullDownRefresh = true,
                                    } = require(indexJsonFile);
                                    oakDisablePulldownRefresh = !enablePullDownRefresh;
                                }
                                pageFiles[ns][dir] = {
                                    path: relativePath.replace(/\\/g, '/'),
                                    oakDisablePulldownRefresh,
                                }
                            }
                            else if (stat.isDirectory()) {
                                const dir2 = join(dir, file);
                                const relativePath2 = join(relativePath, file);
                                traverse(dir2, relativePath2);
                            }
                        }
                    );
                };
                traverse(pageSrcDir, '');
            }
        }
    );
}

module.exports = () => {
    return {
        visitor: {
            Program(path, state) {
                const { cwd, filename } = state;
                const rel = relative(cwd, filename).replace(/\\/g, '/');
                if (
                    /([\\/]*[a-zA-Z0-9_-])*[\\/]src[\\/]app([\\/]*[a-zA-Z0-9_-])*[\\/]router[\\/]index.ts$/.test(
                        rel
                    ) &&
                    rel.endsWith(`/router/index.ts`)
                ) {
                    // console.log('recompile', filename);
                    const { body } = path.node;

                    // namespace从相应目录查询获取
                    const dir = parse(filename).dir;
                    const namespaceDir = join(dir, '..', 'namespaces');
                    const nss = fs.readdirSync(namespaceDir);

                    const namespaceConfig = {};
                    nss.forEach(
                        (ns) => {
                            const dir = join(namespaceDir, ns);
                            const stat = fs.statSync(dir);
                            if (stat.isDirectory()) {
                                namespaceConfig[ns] = {};
                                const indexJsonFile = join(dir, 'index.json');
                                if (fs.existsSync(indexJsonFile)) {
                                    const json = require(indexJsonFile);
                                    let { first, notFound, path } = json;
                                    if (first) {
                                        if (first.startsWith('/')) {
                                            first = first.slice(1);
                                        }
                                        namespaceConfig[ns].first = first.replace(/\\/g, '/');
                                    }
                                    if (notFound) {
                                        if (notFound.startsWith('/')) {
                                            notFound = notFound.slice(1);
                                        }
                                        namespaceConfig[ns].notFound = notFound.replace(/\\/g, '/');
                                    }
                                    if (path) {
                                        if (!path.startsWith('/')) {
                                            path = `/${path}`;
                                        }
                                        namespaceConfig[ns].path = path.replace(/\\/g, '/');
                                    }
                                }
                                else {
                                    namespaceConfig[ns].path = `/${ns}`;
                                }
                            }
                        }
                    );

                    traversePages(nss);

                    const node = body.find(
                        ele => t.isVariableDeclaration(ele) && t.isIdentifier(ele.declarations[0].id) && ele.declarations[0].id.name === 'allRouters'
                    );

                    assert(node, `${filename}中没有定义allRouters`);
                    const declaration = node.declarations[0];
                    const { init } = declaration;
                    assert(t.isArrayExpression(init) && init.elements.length === 0);

                    nss.forEach(
                        (ns) => {
                            const { path, notFound, first } = namespaceConfig[ns];

                            const children = t.arrayExpression(
                                Object.values(pageFiles[ns]).map(
                                    (page) => makeRouterItem(page, ns, path, first)
                                )
                            );
                            if (notFound) {
                                children.elements.push(
                                    t.objectExpression(
                                        [
                                            t.objectProperty(
                                                t.identifier('path'),
                                                t.stringLiteral('*')
                                            ),
                                            t.objectProperty(
                                                t.identifier('namespace'),
                                                t.stringLiteral(path),
                                            ),
                                            t.objectProperty(
                                                t.identifier('Component'),
                                                t.callExpression(
                                                    t.memberExpression(t.identifier('React'), t.identifier('lazy')),
                                                    [
                                                        t.arrowFunctionExpression(
                                                            [],
                                                            t.callExpression(t.import(), [
                                                                t.stringLiteral(join('@project', 'pages', notFound, 'index').replace(/\\/g, '/'))
                                                            ])
                                                        ),
                                                    ]
                                                )
                                            )
                                        ]
                                    )
                                )
                            }

                            init.elements.push(
                                t.objectExpression([
                                    t.objectProperty(
                                        t.identifier('path'),
                                        t.stringLiteral(path),
                                    ),
                                    t.objectProperty(
                                        t.identifier('namespace'),
                                        t.stringLiteral(path),
                                    ),
                                    t.objectProperty(
                                        t.identifier('Component'),
                                        t.callExpression(
                                            t.memberExpression(t.identifier('React'), t.identifier('lazy')),
                                            [
                                                t.arrowFunctionExpression(
                                                    [],
                                                    t.callExpression(t.import(), [
                                                        t.stringLiteral(join('.', '..', 'namespaces', ns).replace(/\\/g, '/')),
                                                    ])
                                                ),
                                            ]
                                        )
                                    ),
                                    t.objectProperty(
                                        t.identifier('children'),
                                        children
                                    )
                                ])
                            );
                        }
                    );

                    body.unshift(
                        t.importDeclaration(
                            [t.importDefaultSpecifier(t.identifier('React'))],
                            t.stringLiteral('react')
                        )
                    );
                    addFileWatcher(filename, nss);

                    /*  const { code } = transformFromAstSync(path.container);
 
                     console.log(code); */
                }
            },
        },
    };
};