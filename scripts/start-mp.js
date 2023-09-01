require('../config/mp/env');

const webpack = require('webpack');
const chalk = require('chalk');
const fs = require('fs-extra');
const configFactory = require('../config/mp/webpack.config');
const config = configFactory('development');

const paths = require('../config/mp/paths');
const getClientEnvironment = require('../config/mp/env');
const env = getClientEnvironment();

fs.emptyDirSync(paths.appBuild);

webpack(config, (err, stats) => {
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
            info.errors.forEach((ele) => console.warn(ele));
        }
        if (stats.hasWarnings()) {
            info.warnings.forEach((ele) => console.warn(ele));
        }
    }
});
