'use strict';

const path = require('path');
const fs = require('fs');


const appDirectory = fs.realpathSync(process.cwd());
const resolveRoot = (relativePath) => path.resolve(appDirectory, relativePath);
const resolveApp = (relativePath) => path.resolve(resolveRoot('wechatMp'), relativePath);

const buildPath = process.env.BUILD_PATH || 'dist';

const moduleFileExtensions = [
  'mp.js',
  'js',
  'mp.ts',
  'ts',
  'json',
  'wxs',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
module.exports = {
    dotenv: resolveApp('.env'),
    appPath: resolveApp('.'),
    appBuild: resolveApp(buildPath),
    appIndexDevJs: resolveModule(resolveApp, 'src/app.dev'),
    appIndexJs: resolveModule(resolveApp, 'src/app'),
    appPackageJson: resolveRoot('package.json'),
    appSrc: resolveApp('src'),
    appTsConfig: resolveRoot('tsconfig.json'),
    appJsConfig: resolveRoot('jsconfig.json'),
    yarnLockFile: resolveRoot('yarn.lock'),
    appNodeModules: resolveRoot('node_modules'),
    appWebpackCache: resolveRoot('node_modules/.cache'),
    appTsBuildInfoFile: resolveRoot('node_modules/.cache/tsconfig.tsbuildinfo'),
    publicUrlOrPath: '/',
    appOutSrc: resolveRoot('src'),
    oakConfigJson: resolveApp('src/oak.config.json'),
};



module.exports.moduleFileExtensions = moduleFileExtensions;
