const { relative, dirname, join } = require('path');
const fs = require('fs');
const t = require('@babel/types');
const traverse = require('@babel/traverse').default;
const assert = require('assert');

/**
 * 
 * @param {*} node 
 * @param {*} projectRoot 
 * @param {*} filename 
 * @param {*} env 'web' | 'native'
 */
function injectGetRender(node, projectRoot, filename, env) {
    assert(t.isCallExpression(node) && t.isIdentifier(node.callee) && node.callee.name === 'OakComponent');
    const dir = dirname(filename);
    if (env === 'web') {
        // web要根据this.props.width的宽度决定注入web.tsx还是web.pc.tsx
        const tsxFile = join(dir, 'web.tsx');
        const jsFile = join(dir, 'web.js');
        const jsxFile = join(dir, 'web.jsx');

        let webDestFile;
        if (fs.existsSync(tsxFile)) {
            webDestFile = './web.tsx';
        }
        else if (fs.existsSync(jsFile)) {
            webDestFile = './web.js';
        }
        else if (fs.existsSync(jsxFile)) {
            webDestFile = './web.jsx';
        }
        const acquireWebFileStmt = webDestFile && t.variableDeclaration('const', [
            t.variableDeclarator(
                t.identifier('oakRenderFn'),
                t.memberExpression(
                    t.callExpression(t.identifier('require'), [
                        t.stringLiteral(webDestFile),
                    ]),
                    t.identifier('default')
                )
            ),
        ]);

        let pcDestFile;
        const pcTsxFile = join(dir, 'web.pc.tsx');
        const pcJsFile = join(dir, 'web.pc.js');
        const pcJsxFile = join(dir, 'web.pc.jsx');
        if (fs.existsSync(pcTsxFile)) {
            pcDestFile = './web.pc.tsx';
        }
        else if (fs.existsSync(pcJsFile)) {
            pcDestFile = './web.pc.js';
        }
        else if (fs.existsSync(pcJsxFile)) {
            pcDestFile = './web.pc.jsx';
        }
        const acquirePcFileStmt = pcDestFile && t.variableDeclaration('const', [
            t.variableDeclarator(
                t.identifier('oakRenderFn'),
                t.memberExpression(
                    t.callExpression(t.identifier('require'), [
                        t.stringLiteral(pcDestFile),
                    ]),
                    t.identifier('default')
                )
            ),
        ]);

        const getStatements = () => {
            /** 根据tsx文件存在的情况，注入如下的getRender函数
             * if (this.props.width === 'xs') {
                    const oakRenderFn = require('./web.tsx').default;
                    return oakRenderFn;
                }
                else {
                    const oakRenderFn = require('./web.pc.tsx').default;
                    return oakRenderFn;
                }
             */
            const statements = [];
            if (acquirePcFileStmt && acquireWebFileStmt) {
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
                        t.blockStatement([
                            acquireWebFileStmt,
                            t.returnStatement(
                                t.identifier('oakRenderFn')
                            )
                        ]),
                        t.blockStatement([
                            acquirePcFileStmt,
                            t.returnStatement(
                                t.identifier('oakRenderFn')
                            )
                        ])
                    )
                );
            }
            else if (acquirePcFileStmt) {
                statements.push(
                    acquirePcFileStmt,
                    t.returnStatement(
                        t.identifier('oakRenderFn')
                    )
                );
            }
            else if (acquireWebFileStmt) {
                statements.push(
                    acquireWebFileStmt,
                    t.returnStatement(
                        t.identifier('oakRenderFn')
                    )
                );
            } else {
                assert(
                    false,
                    `${dir}文件夹中不存在web.tsx或者web.pc.tsx，无法渲染`
                );
            }
            return statements;
        };
        const statements = getStatements();
        node.arguments.forEach((node4) => {
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
    else {
        assert(env === 'native');
        /** native不用检测(react-native会自动检测render.native或render.ios/android），直接注入
         * OakComponent({
         *      getRender() {
         *          const oakRenderFn = require('./render').default;
         *          return oakRenderFn;
         *      },
         * })
         */
        const arg = node.arguments[0];
        assert(t.isObjectExpression(arg));
        // react-native的编译器会命中两次
        if (!arg.properties.find(
            (ele) => t.isObjectProperty(ele) && t.isIdentifier(ele.key) && ele.key.name === 'getRender'
        )) {
            const propertyRender = t.objectProperty(
                t.identifier('getRender'),
                t.functionExpression(null, [], t.blockStatement(
                    [
                        t.variableDeclaration('var', [
                            t.variableDeclarator(
                                t.identifier('oakRenderFn'),
                                t.memberExpression(
                                    t.callExpression(
                                        t.identifier('require'),
                                        [
                                            t.stringLiteral('./render')
                                        ]
                                    ),
                                    t.identifier('default')
                                ),
                            )
                        ]),
                        t.returnStatement(
                            t.identifier('oakRenderFn')
                        )
                    ]
                ))
            );
            arg.properties.unshift(propertyRender); 
        }       
    }
}

module.exports = {
    injectGetRender
};