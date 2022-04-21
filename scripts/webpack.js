const webpack = require('webpack');
const chalk = require('chalk');

const webpackConfig = require('../config/webpack.config');

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
