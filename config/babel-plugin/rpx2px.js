
const css = require('css');

const defaultOptions = {
    baseDpr: 2, // base device pixel ratio (default: 2)
    rpxUnit: 750, // rpx unit value (default: 750)
    rpxPrecision: 6, // rpx value precision (default: 6)
    forceRpxComment: 'rpx', // force px comment (default: `rpx`)
    keepComment: 'no', // no transform value comment (default: `no`)
};

const rpxRegExp = /\b(\d+(\.\d+)?)rpx\b/;


class Rpx2px {
    constructor(options) {
        this.options = Object.assign(defaultOptions, options);
    }

    generatePx(cssText) {
        const self = this;
        const astObj = css.parse(cssText);

        function processRules(rules) {
            // FIXME: keyframes do not support `force px` comment
            const noDealPx = true;
            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];
                if (rule.type === 'media') {
                    processRules(rule.rules); // recursive invocation while dealing with media queries
                    continue;
                } else if (rule.type === 'keyframes') {
                    processRules(rule.keyframes, true); // recursive invocation while dealing with keyframes
                    continue;
                } else if (rule.type !== 'rule' && rule.type !== 'keyframe') {
                    continue;
                }

                const declarations = rule.declarations;
                for (let j = 0; j < declarations.length; j++) {
                    const declaration = declarations[j];
                    // need transform: declaration && has 'rpx'
                    if (
                        declaration.type === 'declaration' &&
                        rpxRegExp.test(declaration.value)
                    ) {
                        const nextDeclaration = declarations[j + 1];
                        if (
                            nextDeclaration &&
                            nextDeclaration.type === 'comment'
                        ) {
                            // next next declaration is comment
                            if (
                                nextDeclaration.comment.trim() ===
                                config.forceRpxComment
                            ) {
                                // force rpx
                                // do not transform `0rpx`
                                if (declaration.value === '0rpx') {
                                    declaration.value = '0';
                                    declarations.splice(j + 1, 1); // delete corresponding comment
                                    continue;
                                }
                                declarations.splice(j + 1, 1); // delete corresponding comment
                            } else {
                                declaration.value = self.getCalcValue(
                                    'px',
                                    declaration.value
                                ); // common transform
                            }
                        } else {
                            declaration.value = self.getCalcValue(
                                'px',
                                declaration.value
                            ); // common transform
                        }
                    }
                }

                // if the origin rule has no declarations, delete it
                if (!rules[i].declarations.length) {
                    rules.splice(i, 1);
                    i--;
                }
            }
        }

        processRules(astObj.stylesheet.rules);

        return css.stringify(astObj);
    }

    getCalcValue(type, value, dpr) {
        const { rpxUnit } = this.options;
        const rpxGlobalRegExp = new RegExp(rpxRegExp.source, 'g');
        function getValue(val) {
            return val == 0 ? val : `calc(100vw / ${rpxUnit} * ${val})`;
        }

        return value.replace(rpxGlobalRegExp, function (ele1, ele2) {
            return type === 'rpx' ? ele2 : getValue(ele2);
        });
    }
}

module.exports = Rpx2px;
