const fs = require('fs');
const { relative, resolve } = require('path');
const t = require('@babel/types');
const { assert } = require('console');

function isOakNamespaceIdentifier(node, name) {
    if (t.isJSXNamespacedName(node) && t.isJSXIdentifier(node.namespace) && node.namespace.name === 'oak'
        && t.isJSXIdentifier(node.name) && node.name.name === name) {
        return true;
    }
    return false;
}

module.exports = (babel) => {
    return {
        visitor: {
            // Program(path, state) {
            //     const { cwd, filename } = state;
            //     const rel = relative(cwd, filename).replace(/\\/g, '/');
            //     if (
            //         /(pages|components)[\w|\W]+(index\.tsx|index\.pc\.tsx|web\.tsx|web\.pc\.tsx|web\.jsx|web\.pc\.jsx)$/.test(
            //             rel
            //         )
            //     ) {
            //         const lessFile = filename.replace(/\.(ts|tsx|jsx)$/, '.less');
            //         const lessFileExists = fs.existsSync(lessFile);
            //         const pcLessFile = filename.replace(
            //             /\.(ts|tsx)$/,
            //             '.pc.less'
            //         );
            //         const pcLessFileExists = fs.existsSync(pcLessFile);
            //         const { body } = path.node;
            //         const lessFileImport = rel.endsWith('.pc.tsx')
            //             ? pcLessFileExists
            //                 ? './index.pc.less'
            //                 : './index.less'
            //             : lessFileExists
            //             ? './index.less'
            //             : './index.pc.less';
            //         if (
            //             (lessFileExists && !pcLessFileExists) ||
            //             (!lessFileExists && pcLessFileExists)
            //         ) {
            //             body.unshift(
            //                 t.importDeclaration(
            //                     [],
            //                     t.stringLiteral(lessFileImport)
            //                 )
            //             );
            //         }
            //     }
            // },
            JSXAttribute(path, state) {
                const { cwd, filename } = state;
                const rel = relative(cwd, filename).replace(/\\/g, '/');
                if (
                    /(pages|components)[\w|\W]+(index\.tsx|index\.pc\.tsx|web\.tsx|web\.pc\.tsx|web\.jsx|web\.pc\.jsx)$/.test(
                        rel
                    )
                ) {
                    const { node } = path;
                    if (isOakNamespaceIdentifier(node.name, 'path')) {
                        // 若存在oak:path，则注入oakParent={this.state.oakFullpath}和oakPath={oak:path}
                        assert(t.isJSXOpeningElement(path.parent));
                        const { attributes } = path.parent;

                        const parentAttr = attributes.find(
                            (ele) =>
                                t.isJSXIdentifier(ele.name) &&
                                ele.name.name === 'oakParent'
                        );
                        if (parentAttr) {
                            console.warn(
                                `「${state.filename}」有JSX元素同时定义了oak:path和oakParent，请确保oakParent等于{this.state.oakFullpath}`
                            );
                        } else {
                            attributes.push(
                                t.jsxAttribute(
                                    t.jsxIdentifier('oakParent'),
                                    t.jsxExpressionContainer(
                                        t.memberExpression(
                                            t.memberExpression(
                                                t.thisExpression(),
                                                t.identifier('state')
                                            ),
                                            t.identifier('oakFullpath')
                                        )
                                    )
                                )
                            );
                        }

                        const pathAttr = attributes.find(
                            (ele) =>
                                t.isJSXIdentifier(ele.name) &&
                                ele.name.name === 'oakPath'
                        );

                        if (pathAttr) {
                            console.warn(
                                `「${state.filename}」有JSX元素同时定义了oak:path和oakPath，请确保两者相等`
                            );
                        } else {
                            attributes.push(
                                t.jsxAttribute(
                                    t.jsxIdentifier('oakPath'),
                                    node.value
                                )
                            );
                        }
                        path.remove();
                    } else if (isOakNamespaceIdentifier(node.name, 'value')) {
                        // 如果是oak:value，增加value和data-attr属性
                        assert(t.isJSXOpeningElement(path.parent));
                        assert(t.isStringLiteral(node.value));
                        const { attributes } = path.parent;

                        const valueAttr = attributes.find(
                            (ele) =>
                                t.isJSXIdentifier(ele.name) &&
                                ele.name.name === 'value'
                        );
                        if (valueAttr) {
                            console.warn(
                                `「${state.filename}」有JSX元素同时定义了oak:value和value，请确保value与formData返回的对应属性名相同}`
                            );
                        } else {
                            attributes.push(
                                t.jsxAttribute(
                                    t.jsxIdentifier('value'),
                                    t.jsxExpressionContainer(
                                        t.memberExpression(
                                            t.memberExpression(
                                                t.thisExpression(),
                                                t.identifier('state')
                                            ),
                                            t.identifier(node.value.value)
                                        )
                                    )
                                )
                            );
                        }

                        const dataAttrAttr = attributes.find(
                            (ele) =>
                                t.isJSXIdentifier(ele.name) &&
                                ele.name.name === 'data-attr'
                        );

                        if (dataAttrAttr) {
                            assert(
                                t.isStringLiteral(dataAttrAttr.value) &&
                                    dataAttrAttr.value.value ===
                                        node.value.value,
                                `「${state.filename}」中有JSX元素同时定义了oak:value和data-attr，且两者的值不相等`
                            );
                        } else {
                            attributes.push(
                                t.jsxAttribute(
                                    t.jsxIdentifier('data-attr'),
                                    node.value
                                )
                            );
                        }
                        path.remove();
                    }
                }
            },
        },
    };
};