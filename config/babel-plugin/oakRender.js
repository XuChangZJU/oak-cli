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
                const tsPage = /pages|components[\w|\W]+index\.(web.ts|ts)$/.test(rel);
                const jsPage = /pages|components[\w|\W]+index\.(web.js|js)$/.test(rel)
                if (tsPage || jsPage) {
                    const tsxFile = filename.replace(/index\.(web.ts|ts)$/, tsPage ? 'web.tsx': 'web.jsx');
                    const tsxFileExists = fs.existsSync(tsxFile);
                    const pcTsxFile = filename.replace(/index\.(web.ts|ts)$/, tsPage ? 'web.pc.tsx' : 'web.pc.jsx');
                    const pcTsxFileExists = fs.existsSync(pcTsxFile);
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
                    const renderStatements = [
                        t.variableDeclaration('const', [
                            t.variableDeclarator(
                                t.identifier('render'),
                                t.memberExpression(
                                    t.callExpression(t.identifier('require'), [
                                        t.stringLiteral(`./web.${tsPage ? 'tsx' : 'jsx'}`),
                                    ]),
                                    t.identifier('default')
                                )
                            ),
                        ]),
                        t.returnStatement(
                            t.callExpression(
                                t.memberExpression(
                                    t.identifier('render'),
                                    t.identifier('call')
                                ),
                                [t.thisExpression()]
                            )
                        ),
                    ];
                    const renderPcStatements = [
                        t.variableDeclaration('const', [
                            t.variableDeclarator(
                                t.identifier('render'),
                                t.memberExpression(
                                    t.callExpression(t.identifier('require'), [
                                        t.stringLiteral(`./web.pc.${tsPage ? 'tsx' : 'jsx'}`),
                                    ]),
                                    t.identifier('default')
                                )
                            ),
                        ]),
                        t.returnStatement(
                            t.callExpression(
                                t.memberExpression(
                                    t.identifier('render'),
                                    t.identifier('call')
                                ),
                                [t.thisExpression()]
                            )
                        ),
                    ];
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
                                t.blockStatement(renderStatements),
                                t.blockStatement(renderPcStatements)
                            )
                        );
                    } else if (tsxFileExists) {
                        statements.push(...renderStatements);
                    } else if (pcTsxFileExists) {
                        statements.push(...renderPcStatements);
                    } else {
                        assert(
                            false,
                            `${filename}文件中不存在index.tsx或者index.pc.tsx`
                        );
                    }
                    const node = path.node;
                    const body = node.body;
                    body.forEach((node2) => {
                        if (
                            node2 &&
                            node2.declaration &&
                            node2.declaration.callee &&
                            (node2.declaration.callee.name === 'OakPage' ||
                                node2.declaration.callee.name ===
                                    'OakComponent')
                        ) {
                            node2.declaration.arguments.forEach((node3) => {
                                if (t.isObjectExpression(node3)) {
                                    const propertyRender = t.objectProperty(
                                        t.identifier('render'),
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
