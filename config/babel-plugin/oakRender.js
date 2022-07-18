const fs = require('fs');
const { relative, resolve } = require('path');
const t = require('@babel/types');
const pull = require('lodash/pull');
const { assert } = require('console');

const oakRegex =
    /(\/*[a-zA-Z0-9_-])*\/app\/(pages|components)\/|(\\*[a-zA-Z0-9_-])*\\app\\(pages|components)\\/;
const localRegex =
    /(\/*[a-zA-Z0-9_-])*\/src\/(pages|components)+\/|(\\*[a-zA-Z0-9_-])*\\src\/(pages|components)+\\/;


module.exports = (babel) => {
    return {
        visitor: {
            Program(path, state) {
                const { cwd, filename } = state;
                const rel = relative(cwd, filename).replace(/\\/g, '/');
                if (/pages|components[\w|\W]+index\.ts$/.test(rel)) {
                    const tsxFile = filename.replace(/\.ts$/, '.tsx');
                    const tsxFileExists = fs.existsSync(tsxFile);
                    const pcTsxFile = filename.replace(/\.ts$/, '.pc.tsx');
                    const pcTsxFileExists = fs.existsSync(pcTsxFile);
                    /** 根据tsx文件存在的情况，注入如下的render代码
                     * if (true) {
                            const renderMobile = require('./index.tsx').default;
                            return renderMobile.call(this);
                        }
                        else {
                            const renderScreen = require('./index.screen.tsx').default;
                            return renderScreen.call(this);
                        }
                     */
                    const renderStatements = [
                        t.variableDeclaration('const', [
                            t.variableDeclarator(
                                t.identifier('render'),
                                t.memberExpression(
                                    t.callExpression(t.identifier('require'), [
                                        t.stringLiteral('./index.tsx'),
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
                                        t.stringLiteral('./index.pc.tsx'),
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
                            `${filename}文件夹中不存在index.tsx或者index.pc.tsx`
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
            CallExpression(path, state) {
                const { cwd, filename } = state;
                const res = resolve(cwd, filename).replace(/\\/g, '/');
                // this.props.t/this.t/t
                // t('common:detail') 不需要处理 t('detail') 需要处理;
                // t(`${common}:${cc}`) 不需要处理 t(`${common}cc`) 需要处理
                if (/(pages|components)[\w|\W]+(.tsx|.ts)$/.test(res)) {
                    const p = res.replace(oakRegex, '').replace(localRegex, '');
                    const eP = p.substring(0, p.lastIndexOf('/'));
                    const ns = eP
                        .split('/')
                        .filter((ele) => !!ele)
                        .join('-');
                    const { node } = path;
                    if (
                        node &&
                        node.callee &&
                        ((t.isIdentifier(node.callee) &&
                            node.callee.name === 't') ||
                            (t.isMemberExpression(node.callee) &&
                                t.isIdentifier(node.callee.property) &&
                                node.callee.property.name === 't'))
                    ) {
                        const arguments = node.arguments;
                        arguments &&
                            arguments.forEach((node2, index) => {
                                if (
                                    index === 0 &&
                                    t.isLiteral(node2) &&
                                    node2.value.indexOf(':') === -1
                                ) {
                                    arguments.splice(
                                        index,
                                        1,
                                        t.stringLiteral(ns + ':' + node2.value)
                                    );
                                }
                            });
                    }
                }
            },
        },
    };
};
