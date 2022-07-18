const fs = require('fs');
const { relative, resolve } = require('path');
const t = require('@babel/types');
const pull = require('lodash/pull');
const { assert } = require('console');

const oakRegex =
    /(\/*[a-zA-Z0-9_-])*\/app\/(pages|components)\/|(\\*[a-zA-Z0-9_-])*\\app\\(pages|components)\\/;
const localRegex =
    /(\/*[a-zA-Z0-9_-])*\/src\/(pages|components)+\/|(\\*[a-zA-Z0-9_-])*\\src\/(pages|components)+\\/;

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
            Program(path, state) {
                const { cwd, filename } = state;
                const rel = relative(cwd, filename).replace(/\\/g, '/');
                if (
                    /(pages|components)[\w|\W]+(index\.tsx|index\.pc\.tsx)$/.test(
                        rel
                    )
                ) {
                    const lessFile = filename.replace(/\.(ts|tsx)$/, '.less');
                    const lessFileExists = fs.existsSync(lessFile);
                    const pcLessFile = filename.replace(
                        /\.(ts|tsx)$/,
                        '.pc.less'
                    );
                    const pcLessFileExists = fs.existsSync(pcLessFile);
                    const { body } = path.node;
                    const lessFileImport = rel.endsWith('.pc.tsx')
                        ? pcLessFileExists
                            ? './index.pc.less'
                            : './index.less'
                        : lessFileExists
                        ? './index.less'
                        : './index.pc.less';
                    body.unshift(
                        t.importDeclaration([], t.stringLiteral(lessFileImport))
                    );
                }
            },
            JSXAttribute(path, state) {
                const { cwd, filename } = state;
                const rel = relative(cwd, filename).replace(/\\/g, '/');
                if (
                    /(pages|components)[\w|\W]+(index\.tsx|index\.pc\.tsx)$/.test(
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
            CallExpression(path, state) {
                const { cwd, filename } = state;
                const res = resolve(cwd, filename).replace(/\\/g, '/');
                // this.props.t/this.t/t
                // t('common:detail') 不需要处理 t('detail') 需要处理;
                // t(`${common}:${cc}`) 不需要处理 t(`${common}cc`) 需要处理
                 if (
                     /(pages|components)[\w|\W]+(.tsx|.ts)$/.test(
                         res
                     )
                 ) {
                    const p = res
                        .replace(oakRegex, '')
                        .replace(localRegex, '');
                    const eP = p.substring(0, p.lastIndexOf('/'));
                    const ns = eP.split('/').filter(ele => !!ele).join('-');
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