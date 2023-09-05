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

const Regex =
    /([\\/]*[a-zA-Z0-9_-\w\W]|[\\/]*[a-zA-Z0-9_-\w\W]:)*[\\/](lib|src|es)[\\/](pages|components|namespaces)+[\\/]/;

module.exports = (babel) => {
    return {
        visitor: {
            Identifier(path, state) {
                const { cwd, filename } = state;
                const resolvePath = resolve(cwd, filename).replace(/\\/g, '/');
                const { node, parent } = path;
                if (node.name === 'OakComponent' && /pages[\w|\W]+index\.(ts|js)$/.test(resolvePath)) {
                    const regexStr = resolvePath.replace(Regex, '/');
                    const relativePath = regexStr.slice(0, regexStr.length - 9);
                    assert(t.isCallExpression(parent));
                    const { arguments } = parent;
                    assert(arguments.length === 1 && t.isObjectExpression(arguments[0]));
                    const { properties } = arguments[0];
                    const pathProperty = properties.find(
                        ele => t.isObjectProperty(ele) && t.isIdentifier(ele.key) && ele.key.name === 'path'
                    );
                    if (pathProperty) {
                        console.warn(`${rel}页面的OakPage中还是定义了path，可以删除掉了`);
                        pathProperty.value = t.stringLiteral(relativePath);
                    }
                    else {
                        properties.push(
                            t.objectProperty(t.identifier('path'), t.stringLiteral(relativePath))
                        );
                    }
                }
            },
        },
    };
};