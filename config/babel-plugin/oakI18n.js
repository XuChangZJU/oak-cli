const fs = require('fs');
const { relative, resolve } = require('path');
const t = require('@babel/types');
const { assert } = require('console');

const Regex =
    /([\\/]*[a-zA-Z0-9_-\w\W]|[\\/]*[a-zA-Z0-9_-\w\W]:)*[\\/](lib|src)([\\/]*[a-zA-Z0-9_-])*[\\/](pages|components)+[\\/]/;

module.exports = (babel) => {
    return {
        visitor: {
            CallExpression(path, state) {
                const { cwd, filename } = state;
                const res = resolve(cwd, filename).replace(/\\/g, '/');
                // this.props.t/this.t/t
                // t('common:detail') 不需要处理 t('detail') 需要处理;
                // t(`${common}:${cc}`) 不需要处理 t(`${common}cc`) 需要处理
                // 只支持t的参数为字符串或模版字符串
                 if (
                     /(pages|components)[\w|\W]+(.tsx|.ts|.jsx|.js)$/.test(res)
                 ) {
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
                         const p = res.replace(Regex, '');
                         const eP = p.substring(0, p.lastIndexOf('/'));
                         const ns = eP
                             .split('/')
                             .filter((ele) => !!ele)
                             .join('-');
                         const arguments = node.arguments;
                         arguments &&
                             arguments.forEach((node2, index) => {
                                 if (
                                     index === 0 &&
                                     t.isLiteral(node2) &&
                                     node2.value &&
                                     node2.value.indexOf(':') === -1
                                 ) {
                                     // t('d')
                                     arguments.splice(
                                         index,
                                         1,
                                         t.stringLiteral(ns + ':' + node2.value)
                                     );
                                 } else if (
                                     index === 0 &&
                                     t.isTemplateLiteral(node2) &&
                                     node2.quasis &&
                                     !node2.quasis.find(
                                         (node3) =>
                                             node3 &&
                                             node3.value &&
                                             node3.value.raw &&
                                             node3.value.raw.indexOf(':') !== -1
                                     )
                                 ) {
                                     // t(`ele`)
                                     node2.quasis.splice(
                                         0,
                                         1,
                                         t.templateElement({
                                             raw:
                                                 ns +
                                                 ':' +
                                                 node2.quasis[0].value.raw,
                                             cooked:
                                                 ns +
                                                 ':' +
                                                 node2.quasis[0].value.cooked,
                                         })
                                     );
                                 }
                                //   else if (
                                //      index === 0 &&
                                //      t.isIdentifier(node2) &&
                                //      node2.name &&
                                //      node2.name.indexOf(':') === -1
                                //  ) {
                                //      // t(ele)
                                //      arguments.splice(
                                //          index,
                                //          1,
                                //          t.binaryExpression(
                                //              '+',
                                //              t.stringLiteral(ns + ':'),
                                //              t.identifier(node2.name)
                                //          )
                                //      );
                                //  } else if (
                                //      index === 0 &&
                                //      t.isMemberExpression(node2) &&
                                //      node2.object.name &&
                                //      node2.object.name.indexOf(':') === -1
                                //  ) {
                                //      // t(ele.label)
                                //      arguments.splice(
                                //          index,
                                //          1,
                                //          t.binaryExpression(
                                //              '+',
                                //              t.stringLiteral(ns + ':'),
                                //              t.memberExpression(
                                //                  t.identifier(
                                //                      node2.object.name
                                //                  ),
                                //                  t.identifier(
                                //                      node2.property.name
                                //                  )
                                //              )
                                //          )
                                //      );
                                //  } 
                             });
                     }
                 }
            },
        },
    };
};