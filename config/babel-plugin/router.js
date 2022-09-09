const fs = require('fs');
const { relative, join, resolve } = require('path');
const t = require('@babel/types');
const assert = require('assert');
const AppPaths = require('../web/paths');

module.exports = () => {
    return {
        visitor: {
            Program(path, state) {
                const { cwd, filename } = state;
                const rel = relative(cwd, filename).replace(/\\/g, '/');
                // if (rel.endsWith(`/src/App.tsx`)) {
                //     const appDir = rel.slice(0, rel.indexOf('/'));
                //     const { body } = path.node;
                //     // 在Function App前面插入router的相关代码
                //     const functionAppNode = body[body.length - 2];
                //     const routerDelarationNode = body[body.length - 3];
                //     assert(
                //         t.isFunctionDeclaration(functionAppNode) &&
                //             t.isIdentifier(functionAppNode.id) &&
                //             functionAppNode.id.name === 'App'
                //     );
                //     assert(
                //         t.isVariableDeclaration(routerDelarationNode) &&
                //             routerDelarationNode.kind === 'let' &&
                //             t.isVariableDeclarator(
                //                 routerDelarationNode.declarations[0]
                //             ) &&
                //             t.isIdentifier(
                //                 routerDelarationNode.declarations[0].id
                //             ) &&
                //             routerDelarationNode.declarations[0].id.name ===
                //                 'routers'
                //     );

                //     const { pages } = require(join(
                //         cwd,
                //         appDir,
                //         'src',
                //         'app.json'
                //     ));
                //     const objs = pages.map((ele) => {
                //         const relPath = ele.replace(/\\/g, '/')
                //             .replace('@project', AppPaths.appRootSrc)
                //             .replace(
                //                 '@oak-general-business',
                //                 AppPaths.oakGeneralBusinessAppPath
                //             );
                //         const jsonFileExists = fs.existsSync(`${relPath}.json`);
                //         const pagePath = ele.slice(
                //             ele.indexOf('pages/') + 6,
                //             ele.length - 6
                //         );
                //         const params = [
                //             t.objectProperty(
                //                 t.identifier('path'),
                //                 t.stringLiteral(pagePath)
                //             ),
                //             t.objectProperty(
                //                 t.identifier('element'),
                //                 t.callExpression(
                //                     t.memberExpression(
                //                         t.identifier('React'),
                //                         t.identifier('lazy')
                //                     ),
                //                     [
                //                         t.arrowFunctionExpression(
                //                             [],
                //                             t.callExpression(t.import(), [
                //                                 t.stringLiteral(ele),
                //                             ])
                //                         ),
                //                     ]
                //                 )
                //             ),
                //         ];
                //         if (jsonFileExists) {
                //             const {
                //                 navigationBarTitleText,
                //             } = require(`${relPath}.json`);
                //             params.unshift(
                //                 t.objectProperty(
                //                     t.identifier('title'),
                //                     t.stringLiteral(
                //                         navigationBarTitleText || ''
                //                     )
                //                 )
                //             );
                //         }
                //         return t.objectExpression(params);
                //     });

                //     body.splice(
                //         body.length - 2,
                //         0,
                //         t.expressionStatement(
                //             t.assignmentExpression(
                //                 '=',
                //                 t.identifier('routers'),
                //                 t.arrayExpression(objs)
                //             )
                //         )
                //     );
                // }
                if (rel.endsWith(`/src/router/index.ts`)) {
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
                        }
                        else if (
                            node &&
                            node.declarations &&
                            node.declarations[0] &&
                            node.declarations[0].id &&
                            node.declarations[0].id.name === 'pages'
                        ) {
                            const init = node.declarations[0].init;
                            const elements = init && init.elements;

                            for (let node2 of elements) {
                                const project = node2.elements[0].value;
                                const path = node2.elements[1].value;
                                const namespaceArr =
                                    node2.elements[2] &&
                                    node2.elements[2].elements &&
                                    node2.elements[2].elements.map(
                                        (ele) => ele.value
                                    );
                                const disableAssemble = node2.elements[3] && node2.elements[3].value;

                                if (namespaceArr && namespaceArr.length > 0) {
                                    for (let namespace of namespaceArr) {
                                        const fIndex = allRouters.findIndex(
                                            (ele) => !!ele.properties.find(property => property.value.value === namespace)
                                        );
                                        if (fIndex < 0) {
                                            //找不到
                                            let relPath = resolve(
                                                filename
                                                    .replace(/\\/g, '/')
                                                    .slice(
                                                        0,
                                                        filename.lastIndexOf('/')
                                                    ),
                                                namespaces[namespace]
                                            ).replace(/\\/g, '/');
                                            if (!relPath.endsWith('/index')) {
                                                relPath = relPath + '/index';
                                            }
                                            const router = getNamespaceRouter(namespaces, namespace, relPath);
                                            const children = [
                                                getRouter(
                                                    project,
                                                    path,
                                                    namespace,
                                                    disableAssemble
                                                ),
                                            ];
                                            router.properties.push(
                                                t.objectProperty(
                                                    t.identifier('children'),
                                                    t.arrayExpression(children)
                                                )
                                            );
                                            allRouters.push(router);
                                        } else {
                                            const router = getRouter(
                                                project,
                                                path,
                                                namespace,
                                                disableAssemble
                                            );
                                            const properties = allRouters[fIndex].properties;

                                            if (properties && properties.length > 0) {
                                                for (let property of properties) {
                                                    if (property.key.name === 'children') {
                                                        if (property.value.elements) {
                                                            property.value.elements.push(
                                                                router
                                                            );
                                                        }
                                                        else {
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
                                    const router = getRouter(
                                        project,
                                        path,
                                        undefined,
                                        disableAssemble
                                    );
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
                }
            },
        },
    };
};

function getRouter(projectOrPath, path, namespace, disableAssemble) {
    const filePath = disableAssemble ? projectOrPath : `${projectOrPath}/pages${path.startsWith('/') ? path : `/${path}`}/index`;
    const relPath = filePath
        .replace(/\\/g, '/')
        .replace('@project', AppPaths.appRootSrc)
        .replace('@oak-general-business', AppPaths.oakGeneralBusinessAppPath);
    const jsonFileExists = fs.existsSync(`${relPath}.json`);
    let meta = [];
    if (jsonFileExists) {
        const { navigationBarTitleText } = require(`${relPath}.json`);
        meta = [
            t.objectProperty(
                t.identifier('title'),
                t.stringLiteral(navigationBarTitleText || '')
            ),
        ];
    }

    const path2 =
        namespace && path.startsWith('/')
            ? path.substring(path.indexOf('/') + 1)
            : path;

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


function getNamespaceRouter(namespaces, namespace, relPath) {
    const filePath = namespaces[namespace];
    const jsonFileExists = fs.existsSync(`${relPath}.json`);
    let meta = [];
    if (jsonFileExists) {
        const { navigationBarTitleText } = require(`${relPath}.json`);
        meta = [
            t.objectProperty(
                t.identifier('title'),
                t.stringLiteral(navigationBarTitleText || '')
            ),
        ];
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
