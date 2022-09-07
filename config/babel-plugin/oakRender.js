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
                const tsPage = (/oak-general-business\/lib/.test(rel) && /(pages|components)[\w|\W]+index\.(web.ts|ts)$/.test(rel)) ||
                    (!/node_modules/.test(rel) && /(pages|components)[\w|\W]+index\.(web.ts|ts)$/.test(rel));
                const jsPage = (/oak-general-business\/lib/.test(rel) && /(pages|components)[\w|\W]+index\.(web.js|js)$/.test(rel)) ||
                    (!/node_modules/.test(rel) && /(pages|components)[\w|\W]+index\.(web.js|js)$/.test(rel));
                if (tsPage || jsPage) {
                    const tsxFile = filename.replace(
                        /index\.(web.ts|ts|web.js|js)$/,
                        tsPage ? 'web.tsx' : 'web.jsx'
                    );
                    const jsFile = filename.replace(
                        /index\.(web.ts|ts|web.js|js)$/,
                        'web.js'
                    );
                    const tsxFileExists = fs.existsSync(tsxFile);
                    const jsFileExists = fs.existsSync(jsFile);
                    const pcTsxFile = filename.replace(
                        /index\.(web.ts|ts|web.js|js)$/,
                        tsPage ? 'web.pc.tsx' : 'web.pc.jsx'
                    );
                    const pcJsFile = filename.replace(
                        /index\.(web.ts|ts|web.js|js)$/,
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
                            t.callExpression(
                                t.memberExpression(
                                    t.identifier('render'),
                                    t.identifier('call')
                                ),
                                [t.thisExpression()]
                            )
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
                            t.callExpression(
                                t.memberExpression(
                                    t.identifier('render'),
                                    t.identifier('call')
                                ),
                                [t.thisExpression()]
                            )
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
                            t.callExpression(
                                t.memberExpression(
                                    t.identifier('render'),
                                    t.identifier('call')
                                ),
                                [t.thisExpression()]
                            )
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
                             t.callExpression(
                                 t.memberExpression(
                                     t.identifier('render'),
                                     t.identifier('call')
                                 ),
                                 [t.thisExpression()]
                             )
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
                        // export default OakPage({})、export default  OakComponent({})
                        if (
                            node2 &&
                            node2.declaration &&
                            node2.declaration.callee &&
                            (node2.declaration.callee.name === 'OakPage' ||
                                node2.declaration.callee.name ===
                                    'OakComponent')
                        ) {
                            const statements = getStatements();
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

                        // exports.default = OakPage({})、exports.default =  OakComponent({})
                         if (
                             node2 &&
                             node2.expression &&
                             node2.expression.right &&
                             node2.expression.right.callee &&
                             (node2.expression.right.callee.name === 'OakPage' ||
                                 node2.expression.right.callee.name ===
                                     'OakComponent')
                         ) {
                             const statements = getStatements();
                             node2.expression.right.arguments.forEach((node3) => {
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
