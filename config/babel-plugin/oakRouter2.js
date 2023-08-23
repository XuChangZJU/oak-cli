const fs = require('fs');
const { relative, join, resolve, parse } = require('path');
const t = require('@babel/types');
const assert = require('assert');
const AppPaths = require('../web/paths');
const { parseSync, transformFromAstSync } = require('@babel/core');

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
                    const { body } = path.node;
                    const appDir = rel.slice(0, rel.indexOf('/'));
                    const allRouters = [];
                    const namespaces = {};

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

                    // pages从相应目录遍历获得
                    const pageSrcDir = join(AppPaths.appRootSrc, 'pages');

                    const pages = [];
                    const traverse = (dir, relativePath) => {
                        const files = fs.readdirSync(dir);
                        files.forEach(
                            (file) => {
                                const filepath = join(dir, file);
                                const stat = fs.statSync(filepath);
                                let added = false;
                                if (stat.isFile() && ['index.tsx', 'web.tsx', 'web.pc.tsx'].includes(file)) {
                                    if (!added) {
                                        const indexJsonFile = join(dir, 'index.json');
                                        let oakDisablePulldownRefresh = false;
                                        if (fs.existsSync(indexJsonFile)) {
                                            const {
                                                enablePullDownRefresh = true,
                                            } = require(indexJsonFile);
                                            oakDisablePulldownRefresh = !enablePullDownRefresh;
                                        }
                                        pages.push({
                                            path: relativePath.replace(/\\/g, '/'),
                                            oakDisablePulldownRefresh,
                                        });
                                        added = true;
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
                                pages.map(
                                    (page) => {
                                        const { path: pagePath, oakDisablePulldownRefresh } = page;
                                        return t.objectExpression(
                                            [
                                                t.objectProperty(
                                                    t.identifier('path'),
                                                    t.stringLiteral(pagePath)
                                                ),
                                                t.objectProperty(
                                                    t.identifier('namespace'),
                                                    t.stringLiteral(path),
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
                                                                    t.stringLiteral(join('@project', 'pages', pagePath, 'index').replace(/\\/g, '/'))
                                                                ])
                                                            ),
                                                        ]
                                                    )
                                                ),
                                                t.objectProperty(
                                                    t.identifier('isFirst'),
                                                    t.booleanLiteral(first === pagePath)
                                                )
                                            ]
                                        )
                                    }
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

                   /*  const { code } = transformFromAstSync(path.container);

                    console.log(code); */
                }
            },
        },
    };
};