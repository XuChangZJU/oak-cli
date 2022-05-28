const webpack = require('webpack');
const chalk = require('chalk');
const { TARGET, NODE_ENV } = require('../config/env');

let webpackConfig;
if (TARGET === 'mp') {
    webpackConfig = require('../config/webpack.config.mp');
}


webpack(webpackConfig, (err, stats) => {
  if (err) {
    console.log(chalk.red(err.stack || err));
    if (err.details) {
      console.log(chalk.red(err.details));
    }
    return undefined;
  }
  if (stats) {
    const info = stats.toJson();
    if (stats.hasErrors()) {
      info.errors.forEach(
        ele => console.warn(ele)
      );      
    }
    if (stats.hasWarnings()) {
      info.warnings.forEach(
        ele => console.warn(ele)
      );
    }
  }
});
