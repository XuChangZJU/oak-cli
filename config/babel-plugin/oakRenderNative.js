const t = require('@babel/types');
const { parse } = require('path');
const { injectGetRender } = require('../utils/injectGetRender');

module.exports = (babel) => {
    return {
        visitor: {
            CallExpression(path, state) {
                const { cwd, filename } = state;
                const { base } = parse(filename);
                const node = path.node;
                if (['index.ts', 'index.js'].includes(base) && t.isCallExpression(node) && t.isIdentifier(node.callee) && node.callee.name === 'OakComponent') {
                    injectGetRender(node, cwd, filename, 'native');
                }
            },
        },
    };
};
