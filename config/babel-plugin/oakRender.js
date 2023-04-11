const fs = require('fs');
const { relative, resolve } = require('path');
const t = require('@babel/types');
const { assert } = require('console');

module.exports = (babel) => {
    return {
        visitor: {
            Program(path, state) {
                const { cwd, filename } = state;
                const rel = relative(cwd, filename).replace(/\\/g, '/');
                const tsPage = /(pages|components)\/[\w|\W]+\/index\.ts$/.test(rel);
                const jsPage = /(pages|components)\/[\w|\W]+\/index\.js$/.test(rel);
                if (tsPage || jsPage) {
                    const tsxFile = filename.replace(
                        /index\.(ts|js)$/,
                        tsPage ? 'web.tsx' : 'web.jsx'
                    );
                    const jsFile = filename.replace(
                        /index\.(ts|js)$/,
                        'web.js'
                    );
                    const tsxFileExists = fs.existsSync(tsxFile);
                    const jsFileExists = fs.existsSync(jsFile);
                    const pcTsxFile = filename.replace(
                        /index\.(ts|js)$/,
                        tsPage ? 'web.pc.tsx' : 'web.pc.jsx'
                    );
                    const pcJsFile = filename.replace(
                        /index\.(ts|js)$/,
                        'web.pc.js'
                    );
                    const pcTsxFileExists = fs.existsSync(pcTsxFile);
                    const pcJsFileExists = fs.existsSync(pcJsFile);


                    /** 根据tsx文件存在的情况，注入如下的render代码
                     * if (this.props.width === 'xs') {
                            const renderMobile = require('./web.tsx').default;
                            return renderMobile.call(this);
                        }
                        else {
                            const renderScreen = require('./web.pc.tsx').default;
                            return renderScreen.call(this);
                        }
                     */
                    const renderTsxStatements = [
                        t.variableDeclaration('const', [
                            t.variableDeclarator(
                                t.identifier('render'),
                                t.memberExpression(
                                    t.callExpression(t.identifier('require'), [
                                        t.stringLiteral(
                                            `./web.${tsPage ? 'tsx' : 'jsx'}`
                                        ),
                                    ]),
                                    t.identifier('default')
                                )
                            ),
                        ]),
                        t.returnStatement(
                            t.identifier('render')
                        ),
                    ];
                    const renderJsStatements = [
                        t.variableDeclaration('const', [
                            t.variableDeclarator(
                                t.identifier('render'),
                                t.memberExpression(
                                    t.callExpression(t.identifier('require'), [
                                        t.stringLiteral('./web.js'),
                                    ]),
                                    t.identifier('default')
                                )
                            ),
                        ]),
                        t.returnStatement(
                            t.identifier('render')
                        ),
                    ];
                    const renderPcTsxStatements = [
                        t.variableDeclaration('const', [
                            t.variableDeclarator(
                                t.identifier('render'),
                                t.memberExpression(
                                    t.callExpression(t.identifier('require'), [
                                        t.stringLiteral(
                                            `./web.pc.${tsPage ? 'tsx' : 'jsx'}`
                                        ),
                                    ]),
                                    t.identifier('default')
                                )
                            ),
                        ]),
                        t.returnStatement(
                            t.identifier('render')
                        ),
                    ];
                    const renderPcJsStatements = [
                        t.variableDeclaration('const', [
                            t.variableDeclarator(
                                t.identifier('render'),
                                t.memberExpression(
                                    t.callExpression(t.identifier('require'), [
                                        t.stringLiteral('./web.pc.js'),
                                    ]),
                                    t.identifier('default')
                                )
                            ),
                        ]),
                        t.returnStatement(
                            t.identifier('render')
                        ),
                    ];
                    const getStatements = () => {
                        const statements = [];
                        if (tsxFileExists && pcTsxFileExists) {
                            statements.push(
                                t.ifStatement(
                                    t.binaryExpression(
                                        '===',
                                        t.memberExpression(
                                            t.memberExpression(
                                                t.thisExpression(),
                                                t.identifier('props')
                                            ),
                                            t.identifier('width')
                                        ),
                                        t.stringLiteral('xs')
                                    ),
                                    t.blockStatement(renderTsxStatements),
                                    t.blockStatement(renderPcTsxStatements)
                                )
                            );
                        } else if (jsFileExists && pcJsFileExists) {
                            statements.push(
                                t.ifStatement(
                                    t.binaryExpression(
                                        '===',
                                        t.memberExpression(
                                            t.memberExpression(
                                                t.thisExpression(),
                                                t.identifier('props')
                                            ),
                                            t.identifier('width')
                                        ),
                                        t.stringLiteral('xs')
                                    ),
                                    t.blockStatement(renderJsStatements),
                                    t.blockStatement(renderPcJsStatements)
                                )
                            );
                        } else if (jsFileExists && pcTsxFileExists) {
                            statements.push(
                                t.ifStatement(
                                    t.binaryExpression(
                                        '===',
                                        t.memberExpression(
                                            t.memberExpression(
                                                t.thisExpression(),
                                                t.identifier('props')
                                            ),
                                            t.identifier('width')
                                        ),
                                        t.stringLiteral('xs')
                                    ),
                                    t.blockStatement(renderJsStatements),
                                    t.blockStatement(renderPcTsxStatements)
                                )
                            );
                        } else if (tsxFileExists && pcJsFileExists) {
                            statements.push(
                                t.ifStatement(
                                    t.binaryExpression(
                                        '===',
                                        t.memberExpression(
                                            t.memberExpression(
                                                t.thisExpression(),
                                                t.identifier('props')
                                            ),
                                            t.identifier('width')
                                        ),
                                        t.stringLiteral('xs')
                                    ),
                                    t.blockStatement(renderTsxStatements),
                                    t.blockStatement(renderPcJsStatements)
                                )
                            );
                        } else if (tsxFileExists) {
                            statements.push(...renderTsxStatements);
                        } else if (pcTsxFileExists) {
                            statements.push(...renderPcTsxStatements);
                        } else if (jsFileExists) {
                            statements.push(...renderJsStatements);
                        } else if (pcJsFileExists) {
                            statements.push(...renderPcJsStatements);
                        } else {
                            assert(
                                false,
                                `${filename}文件中不存在web.tsx或者web.pc.tsx`
                            );
                        }
                        return statements;
                    };
                    const node = path.node;
                    const body = node.body;
                    body.forEach((node2) => {
                        // export default  OakComponent({})
                        if (t.isExportDefaultDeclaration(node2)) {
                            let node3 = node2.declaration;
                            if (node3) {
                                if (t.isTSAsExpression(node3)) {
                                    // export default OakComponent({}) as ....
                                    node3 = node3.expression;
                                }
                            }

                            if (t.isCallExpression(node3) && node3.callee.name === 'OakComponent') {
                                const statements = getStatements();
                                node3.arguments.forEach((node4) => {
                                    if (t.isObjectExpression(node4)) {
                                        const propertyRender = t.objectProperty(
                                            t.identifier('getRender'),
                                            t.functionExpression(
                                                null,
                                                [],
                                                t.blockStatement(statements)
                                            )
                                        );
                                        node4.properties.unshift(propertyRender);
                                    }
                                    else {
                                        assert(false, `[${filename}]OakComponent调用参数不是ObjectExpression`);
                                    }
                                });
                            }
                        }
                        // exports.default = OakPage({})、exports.default =  OakComponent({})
                        else if (t.isExpressionStatement(node2) && t.isAssignmentExpression(node2.expression) &&
                            t.isFunctionExpression(node2.expression.right) &&
                            t.isIdentifier(node2.expression.right.callee) && node2.expression.right.callee.name === 'OakComponent'
                        ) {
                            const statements = getStatements();
                            node2.expression.right.arguments.forEach((node3) => {
                                if (t.isObjectExpression(node3)) {
                                    const propertyRender = t.objectProperty(
                                        t.identifier('getRender'),
                                        t.functionExpression(
                                            null,
                                            [],
                                            t.blockStatement(statements)
                                        )
                                    );
                                    node3.properties.unshift(propertyRender);
                                }
                            });
                        }
                    });
                }
            },
        },
    };
};
