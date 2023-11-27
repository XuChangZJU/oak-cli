const t = require('@babel/types');
const assert = require('assert');

const REPLACE_HOLDERS = {
    OAK_PLATFORM: 'native',
};

function replaceEnvExpressionPlugin() {
    return {
        visitor: {
            MemberExpression(path, state) {
                const { node } = path;
                // process.env.XXXXX
                if (
                    t.isMemberExpression(node) &&
                    t.isMemberExpression(node.object) &&
                    t.isIdentifier(node.object.object) &&
                    node.object.object.name === 'process'  &&
                    t.isIdentifier(node.object.property) &&
                    node.object.property.name === 'env'
                ) {
                    const { property } = node;
                    assert(t.isIdentifier(property));
                    const { name } = property;
                    if (REPLACE_HOLDERS[name]) {
                        console.log(state.filename, name);
                        path.replaceWith(
                            t.stringLiteral(REPLACE_HOLDERS[name])
                        );
                    }
                }
            }
        }
    };
}

module.exports = replaceEnvExpressionPlugin;