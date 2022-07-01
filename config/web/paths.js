'use strict';

const path = require('path');
const fs = require('fs');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveRoot = (relativePath) => path.resolve(appDirectory, relativePath);
const resolveApp = (relativePath) => path.resolve(resolveRoot('web'), relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
    process.env.NODE_ENV === 'development',
    require(resolveRoot('package.json')).homepage,
    process.env.PUBLIC_URL
);

const buildPath = process.env.BUILD_PATH || 'build';

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
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
    appPublic: resolveApp('public'),
    appHtml: resolveApp('public/index.html'),
    appIndexDevJs: resolveModule(resolveApp, 'src/index.dev'),
    appIndexJs: resolveModule(resolveApp, 'src/index'),
    appPackageJson: resolveRoot('package.json'),
    appSrc: resolveApp('src'),
    appTsConfig: resolveRoot('tsconfig.web.json'),
    appJsConfig: resolveRoot('jsconfig.json'),
    yarnLockFile: resolveRoot('yarn.lock'),
    testsSetup: resolveModule(resolveApp, 'src/setupTests'),
    proxySetup: resolveApp('src/setupProxy.js'),
    appNodeModules: resolveRoot('node_modules'),
    appWebpackCache: resolveRoot('node_modules/.cache'),
    appTsBuildInfoFile: resolveRoot('node_modules/.cache/tsconfig.tsbuildinfo'),
    swSrc: resolveModule(resolveApp, 'src/service-worker'),
    publicUrlOrPath,
    appOutSrc: resolveRoot('src'),
    appOutPath: resolveRoot('.'),
    oakConfigJson: resolveRoot('oak.config.json'),
};



module.exports.moduleFileExtensions = moduleFileExtensions;
