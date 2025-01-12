/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// References:
// - https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#plugin-hooks
// - https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/issues/232#issuecomment-645543747
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = class ForkTsCheckerWarningWebpackPlugin {
  constructor(options) {
     this.options = options;
  }
  apply(compiler) {
    new ForkTsCheckerWebpackPlugin(this.options).apply(compiler);

    const hooks = ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler);

    hooks.issues.tap('ForkTsCheckerWarningWebpackPlugin', issues =>
      issues.map(issue => ({ ...issue, severity: 'warning' }))
    );
  }
};
