const t = require('@babel/types');
const pull = require('lodash/pull');
const { assert } = require('console');

module.exports = (babel) => {
    return {
        visitor: {
            Program(path, state) {
                const node = path.node;
                const body = node.body;
                let isOak = false;
                body.forEach((node2) => {
                    if (
                        node2 &&
                        node2.declaration &&
                        node2.declaration.callee &&
                        (node2.declaration.callee.name === 'OakPage' ||
                            node2.declaration.callee.name === 'OakComponent')
                    ) {
                        isOak = true;
                        node2.declaration.arguments.forEach((node3) => {
                            if (t.isObjectExpression(node3)) {
                                const propertyRender = t.objectProperty(
                                    t.identifier('render'),
                                    t.identifier('render')
                                );
                                node3.properties.unshift(propertyRender);
                            }
                        });
                    }
                });
                if (isOak) {
                    const importRender = t.importDeclaration(
                        [t.importDefaultSpecifier(t.identifier('render'))],
                        t.stringLiteral('./index.tsx')
                    );

                    body.unshift(importRender);
                }
            },
        },
    };
};
