
module.exports = {
    customSyntax: 'postcss-less',
    extends: 'stylelint-config-standard',
    rules: {
        'at-rule-no-vendor-prefix': true,
        'media-feature-name-no-vendor-prefix': true,
        'property-no-vendor-prefix': true,
        'selector-max-compound-selectors': 10,
        'selector-no-vendor-prefix': true,
        'value-no-vendor-prefix': true,
        'unit-no-unknown': [true, { ignoreUnits: ['rpx', 'px'] }],
        'no-descending-specificity': null,
        'at-rule-no-unknown': null,
        'declaration-block-no-duplicate-properties': null,
        'no-duplicate-selectors': null,
        'selector-class-pattern': null,
        'font-family-no-missing-generic-family-keyword': null,
        'function-no-unknown': [true, { ignoreFunctions: ['alpha', 'constant', 'fadeout'] }],
        'declaration-block-no-shorthand-property-overrides': null,
        'no-empty-source': null,
        'selector-type-no-unknown': null
    },
};