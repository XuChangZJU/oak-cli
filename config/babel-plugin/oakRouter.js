const fs = require('fs');
const { relative, join, resolve } = require('path');
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
                    for (let node of body) {
                        if (
                            node &&
                            node.declarations &&
                            node.declarations[0] &&
                            node.declarations[0].id &&
                            node.declarations[0].id.name === 'namespaces'
                        ) {
                            const init = node.declarations[0].init;
                            const properties = init && init.properties;
                            if (properties && properties.length > 0) {
                                for (let property of properties) {
                                    namespaces[property.key.value] =
                                        property.value.value;
                                }
                            }
                        } else if (
                            node &&
                            node.declarations &&
                            node.declarations[0] &&
                            node.declarations[0].id &&
                            node.declarations[0].id.name === 'pages'
                        ) {
                            const init = node.declarations[0].init;
                            const elements = init && init.elements;

                            for (let node2 of elements) {
                                if (!node2.elements) {
                                    continue;
                                }
                                const projectAlias = node2.elements[0].value;
                                const path = node2.elements[1].value;
                                const namespaceArr =
                                    node2.elements[2] &&
                                    node2.elements[2].elements &&
                                    node2.elements[2].elements.map(
                                        (ele) => ele.value
                                    );
                                const isFirst =
                                    node2.elements[3] &&
                                    node2.elements[3].value;
                                const routePath =
                                    node2.elements[4] &&
                                    node2.elements[4].value;

                                if (namespaceArr && namespaceArr.length > 0) {
                                    for (let namespace of namespaceArr) {
                                        const fIndex = allRouters.findIndex(
                                            (ele) =>
                                                !!ele.properties.find(
                                                    (property) =>
                                                        property.value.value ===
                                                        namespace
                                                )
                                        );
                                        if (fIndex < 0) {
                                            //找不到
                                            const router = getNamespaceRouter({
                                                namespaces,
                                                namespace,
                                                filename,
                                            });
                                            const children = [
                                                getRouter({
                                                    projectAlias,
                                                    path,
                                                    routePath,
                                                    namespace,
                                                    isFirst,
                                                }),
                                            ];
                                            router.properties.push(
                                                t.objectProperty(
                                                    t.identifier('children'),
                                                    t.arrayExpression(children)
                                                )
                                            );
                                            allRouters.push(router);
                                        } else {
                                            const router = getRouter({
                                                projectAlias,
                                                path,
                                                routePath,
                                                namespace,
                                                isFirst,
                                            });
                                            const properties =
                                                allRouters[fIndex].properties;

                                            if (
                                                properties &&
                                                properties.length > 0
                                            ) {
                                                for (let property of properties) {
                                                    if (
                                                        property.key.name ===
                                                        'children'
                                                    ) {
                                                        if (
                                                            property.value
                                                                .elements
                                                        ) {
                                                            property.value.elements.push(
                                                                router
                                                            );
                                                        } else {
                                                            property.value =
                                                                t.arrayExpression(
                                                                    [router]
                                                                );
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    const router = getRouter({
                                        projectAlias,
                                        path,
                                        routePath,
                                        isFirst,
                                    });
                                    allRouters.push(router);
                                }
                            }
                        }
                    }
                    body.unshift(
                        t.importDeclaration(
                            [t.importDefaultSpecifier(t.identifier('React'))],
                            t.stringLiteral('react')
                        )
                    );

                    body.splice(
                        body.length - 1,
                        0,
                        t.expressionStatement(
                            t.assignmentExpression(
                                '=',
                                t.identifier('allRouters'),
                                t.arrayExpression(allRouters)
                            )
                        )
                    );

                    const { code } = transformFromAstSync(path.container);

                    console.log(code);
                }
            },
        },
    };
};

function getRouter({ projectAlias, path, namespace, routePath, isFirst }) {
    const filePath = `${projectAlias}/pages${
        path.startsWith('/') ? path : `/${path}`
    }/index`;
    const relPath = filePath
        .replace(/\\/g, '/')
        .replace('@project', AppPaths.appRootSrc)
        .replace('@oak-general-business', AppPaths.oakGeneralBusinessPath);
    const jsonFileExists = fs.existsSync(`${relPath}.json`);
    let meta = [];
    if (jsonFileExists) {
        const {
            navigationBarTitleText,
            enablePullDownRefresh = true,
        } = require(`${relPath}.json`);
        meta.push(
            t.objectProperty(
                t.identifier('navigationBarTitleText'),
                t.stringLiteral(navigationBarTitleText || '')
            )
        );
        meta.push(
            t.objectProperty(
                t.identifier('oakDisablePulldownRefresh'),
                t.booleanLiteral(!enablePullDownRefresh) //默认启用下拉刷新
            )
        );
    }
    let path2;
    if (routePath) {
        path2 =
            namespace && routePath.startsWith('/')
                ? routePath.substring(routePath.indexOf('/') + 1)
                : routePath;
    }
    else {
        path2 =
            namespace && path.startsWith('/')
                ? path.substring(path.indexOf('/') + 1)
                : path;
    }

    const properties = [
        t.objectProperty(t.identifier('path'), t.stringLiteral(path2)),
        t.objectProperty(
            t.identifier('Component'),
            t.callExpression(
                t.memberExpression(t.identifier('React'), t.identifier('lazy')),
                [
                    t.arrowFunctionExpression(
                        [],
                        t.callExpression(t.import(), [
                            t.stringLiteral(filePath),
                        ])
                    ),
                ]
            )
        ),
        t.objectProperty(t.identifier('meta'), t.objectExpression(meta)),
    ];
    if (isFirst) {
        properties.push(
            t.objectProperty(t.identifier('isFirst'), t.booleanLiteral(isFirst))
        );
    }
    if (namespace) {
        properties.push(
            t.objectProperty(
                t.identifier('namespace'),
                t.stringLiteral(namespace)
            )
        );
    }
    if (routePath) {
        properties.push(
            t.objectProperty(
                t.identifier('customRouter'),
                t.booleanLiteral(!!routePath)
            )
        );
    }

    return t.objectExpression(properties);
}


function getNamespaceRouter({ namespaces, namespace, filename }) {
    let relPath = resolve(
        filename.replace(/\\/g, '/').slice(0, filename.lastIndexOf('/')),
        namespaces[namespace]
    ).replace(/\\/g, '/');
    if (!relPath.endsWith('/index')) {
        relPath = relPath + '/index';
    }
    const filePath = namespaces[namespace];
    const jsonFileExists = fs.existsSync(`${relPath}.json`);
    let meta = [];
    if (jsonFileExists) {
        const {
            navigationBarTitleText,
            oakDisablePulldownRefresh = true,
        } = require(`${relPath}.json`);
        meta.push(
            t.objectProperty(
                t.identifier('navigationBarTitleText'),
                t.stringLiteral(navigationBarTitleText || '')
            )
        );
        meta.push(
            t.objectProperty(
                t.identifier('oakDisablePulldownRefresh'),
                t.booleanLiteral(oakDisablePulldownRefresh) // 嵌套路由顶层默认不启用下拉刷新
            )
        );
    }
    const properties = [
        t.objectProperty(t.identifier('path'), t.stringLiteral(namespace)),
        t.objectProperty(
            t.identifier('Component'),
            filePath
                ? t.callExpression(
                      t.memberExpression(
                          t.identifier('React'),
                          t.identifier('lazy')
                      ),
                      [
                          t.arrowFunctionExpression(
                              [],
                              t.callExpression(t.import(), [
                                  t.stringLiteral(filePath),
                              ])
                          ),
                      ]
                  )
                : t.stringLiteral('undefined')
        ),
        t.objectProperty(t.identifier('meta'), t.objectExpression(meta)),
    ];
    if (namespace) {
        properties.push(
            t.objectProperty(
                t.identifier('namespace'),
                t.stringLiteral(namespace)
            )
        );
    }
    return t.objectExpression(properties);
}
