/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 * @oncall react_native
 */

"use strict";

const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const path = require('path');
const less = require('less');
const svgTransformer = require('react-native-svg-transformer');
const lessTransformer = require('react-native-less-transformer');

const css2rn = require("css-to-react-native-transform").default;
const { parseSync, transformFromAstSync, transformSync: babelTransform } = require("@babel/core");
const nullthrows = require("nullthrows");
const replaceEnvExpressionPlugin = require('./babelEnvPlugin');

const { injectGetRender } = require('../utils/injectGetRender');
const oakPathTsxPlugin = require('../babel-plugin/oakPath');
const oakRenderNativePlugin = require('../babel-plugin/oakRenderNative');
const oakI18nPlugin = require('../babel-plugin/oakI18n');

async function renderToCSS({ src, filename, options = {} }) {
    const { lessOptions = {} } = options;
    const { css } = await less.render(src, { paths: [path.dirname(filename)], ...lessOptions });
    return css;
}

function renderCSSToReactNative(css) {
    return css2rn(css, { parseMediaQueries: true });
}

function transform({ filename, options, plugins, src }) {
    const OLD_BABEL_ENV = process.env.BABEL_ENV;
    process.env.BABEL_ENV = options.dev
        ? "development"
        : process.env.BABEL_ENV || "production";
    try {
        const babelConfig = {
            caller: {
                name: "oak",
                bundler: "oak",
                platform: options.platform,
            },
            ast: true,
            babelrc: options.enableBabelRCLookup,
            code: false,
            cwd: options.projectRoot,
            highlightCode: true,
            filename,
            plugins: plugins.concat([replaceEnvExpressionPlugin, oakPathTsxPlugin, oakRenderNativePlugin, oakI18nPlugin]),
            sourceType: "module",
            // NOTE(EvanBacon): We split the parse/transform steps up to accommodate
            // Hermes parsing, but this defaults to cloning the AST which increases
            // the transformation time by a fair amount.
            // You get this behavior by default when using Babel's `transform` method directly.
            cloneInputAst: false,
        };

        const transInner = (src) => {
            const sourceAst = options.hermesParser
                ? require("hermes-parser").parse(src, {
                    babel: true,
                    sourceType: babelConfig.sourceType,
                })
                : parseSync(src, babelConfig);

            const transformResult = transformFromAstSync(sourceAst, src, babelConfig);

            // 为page和componet下的OakComponent注入getRender函数，去取得同目录下的render.native.tsx
            // 改成plugin注入
            // const resultAst = transformResult.ast;
            // const { base } = path.parse(filename);
            // if (['index.ts', 'index.js'].includes(base)) {
            //     traverse(resultAst, {
            //         CallExpression(path) {
            //             const node = path.node;
            //             if (t.isIdentifier(node.callee) && node.callee.name === 'OakComponent') {
            //                 injectGetRender(node, options.projectRoot, filename, 'native');
            //             }
            //         }
            //     })
            // }
            
            return {
                ast: nullthrows(transformResult.ast),
                metadata: transformResult.metadata,
            };
        };

        if (filename.endsWith('less')) {
            // return renderToCSS({ src, filename, options }).then((css) => {
            //     const cssObject = renderCSSToReactNative(css);
            //     const newSrc = `module.exports = ${JSON.stringify(cssObject)}`;
            //     return transInner(newSrc);
            // });
            return lessTransformer.transform({ src, filename, options });
        }
        else if (filename.endsWith('.svg')) {
            return svgTransformer.transform({ src, filename, options });
        } 
        
        return transInner(src);
    } finally {
        if (OLD_BABEL_ENV) {
            process.env.BABEL_ENV = OLD_BABEL_ENV;
        }
    }
}
module.exports = {
    transform,
};
