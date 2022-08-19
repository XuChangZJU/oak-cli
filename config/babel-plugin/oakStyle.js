const fs = require('fs');
const { relative } = require('path');
const { assert } = require('console');
const t = require('@babel/types');
const generate = require('@babel/generator').default;
const parser = require("@babel/parser");

const defaultOptions = {
    baseDpr: 2, // base device pixel ratio (default: 2)
    rpxUnit: 750, // rpx unit value (default: 750)
    rpxPrecision: 6, // rpx value precision (default: 6)
    forceRpxComment: 'rpx', // force px comment (default: `rpx`)
    keepComment: 'no', // no transform value comment (default: `no`)
};

const rpxRegExp = /\b(\d+(\.\d+)?)rpx\b/;

module.exports = (babel) => {
    return {
        visitor: {
            JSXAttribute(path, state) {
                const { cwd, filename } = state;
                if (
                    path.node &&
                    t.isJSXIdentifier(path.node.name) &&
                    path.node.name.name === 'style'
                ) {
                    const properties =
                        path.node.value &&
                        path.node.value.expression &&
                        path.node.value.expression.properties;

                    if (properties) {
                        properties.forEach((node2, index) => {
                            const { key, value } = node2;
                            const code = generate(value);

                            function getValue(val) {
                                return val == 0
                                    ? val
                                    : `calc(100vw / ${defaultOptions.rpxUnit} * ${val})`;
                            }

                            const rpxGlobalRegExp = new RegExp(
                                rpxRegExp.source,
                                'g'
                            );
                            let codeStr = code.code;
                            if (rpxGlobalRegExp.test(codeStr)) {
                                codeStr = codeStr.replace(
                                    rpxGlobalRegExp,
                                    function ($0, $1) {
                                        return getValue($1);
                                    }
                                );
                                console.log('code2', codeStr);

                                const ast2 = parser.parse(
                                    "30px",
                                    {
                                        sourceType: 'module',
                                        plugins: ['jsx'],
                                    }
                                );
                                console.log('ast2', JSON.stringify(ast2));

                                properties.splice(
                                    index,
                                    1,
                                    t.objectProperty(key, value)
                                );
                            }
                        });
                    }                
                }
            },
        },
    };
};
