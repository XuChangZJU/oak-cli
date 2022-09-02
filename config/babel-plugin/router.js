const fs = require('fs');
const { relative, join } = require('path');
const t = require('@babel/types');
const assert = require('assert');
const AppPaths = require('../web/paths');

module.exports = () => {
    return {
        visitor: {
            Program(path, state) {
                const { cwd, filename } = state;
                const rel = relative(cwd, filename).replace(/\\/g, '/');
                if (rel.endsWith(`/src/App.tsx`)) {
                    const appDir = rel.slice(0, rel.indexOf('/'));
                    const { body } = path.node;
                    // 在Function App前面插入router的相关代码
                    const functionAppNode = body[body.length - 2];
                    const routerDelarationNode = body[body.length - 3];
                    assert(
                        t.isFunctionDeclaration(functionAppNode) &&
                            t.isIdentifier(functionAppNode.id) &&
                            functionAppNode.id.name === 'App'
                    );
                    assert(
                        t.isVariableDeclaration(routerDelarationNode) &&
                            routerDelarationNode.kind === 'let' &&
                            t.isVariableDeclarator(
                                routerDelarationNode.declarations[0]
                            ) &&
                            t.isIdentifier(
                                routerDelarationNode.declarations[0].id
                            ) &&
                            routerDelarationNode.declarations[0].id.name ===
                                'routers'
                    );

                    const { pages } = require(join(
                        cwd,
                        appDir,
                        'src',
                        'app.json'
                    ));
                    const objs = pages.map((ele) => {
                        const relPath = ele.replace(/\\/g, '/')
                            .replace('@project', AppPaths.appRootSrc)
                            .replace(
                                '@oak-general-business',
                                AppPaths.oakGeneralBusinessAppPath
                            );
                        const jsonFileExists = fs.existsSync(`${relPath}.json`);
                        const pagePath = ele.slice(
                            ele.indexOf('pages/') + 6,
                            ele.length - 6
                        );
                        const params = [
                            t.objectProperty(
                                t.identifier('path'),
                                t.stringLiteral(pagePath)
                            ),
                            t.objectProperty(
                                t.identifier('element'),
                                t.callExpression(
                                    t.memberExpression(
                                        t.identifier('React'),
                                        t.identifier('lazy')
                                    ),
                                    [
                                        t.arrowFunctionExpression(
                                            [],
                                            t.callExpression(t.import(), [
                                                t.stringLiteral(ele),
                                            ])
                                        ),
                                    ]
                                )
                            ),
                        ];
                        if (jsonFileExists) {
                            const {
                                navigationBarTitleText,
                            } = require(`${relPath}.json`);
                            params.unshift(
                                t.objectProperty(
                                    t.identifier('title'),
                                    t.stringLiteral(
                                        navigationBarTitleText || ''
                                    )
                                )
                            );
                        }
                        return t.objectExpression(params);
                    });

                    body.splice(
                        body.length - 2,
                        0,
                        t.expressionStatement(
                            t.assignmentExpression(
                                '=',
                                t.identifier('routers'),
                                t.arrayExpression(objs)
                            )
                        )
                    );
                }
            },
        },
    };
};
