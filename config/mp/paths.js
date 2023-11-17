'use strict';

const path = require('path');
const fs = require('fs');

const subDirName = process.env.SUB_DIR_NAME || 'wechatMp';

const appDirectory = fs.realpathSync(process.cwd());
const resolveRoot = (relativePath) => path.resolve(appDirectory, relativePath);
const resolveApp = (relativePath) => path.resolve(resolveRoot(subDirName), relativePath);

const buildPath = process.env.BUILD_PATH || 'dist';

let moduleFileExtensions = [
  'mp.js',
  'js',
  'mp.ts',
  'ts',
];
if (process.env.NODE_ENV !== 'production' && process.env.PROD !== 'true') {
    moduleFileExtensions = [
        'dev.mp.js',
        'dev.mp.ts',
        'dev.js',
        'dev.ts',
    ].concat(moduleFileExtensions);
} else {
    moduleFileExtensions = [
        'prod.mp.js',
        'prod.mp.ts',
        'prod.js',
        'prod.ts',
    ].concat(moduleFileExtensions);
}

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
    appTsConfig: resolveRoot('tsconfig.mp.json'),
    appJsConfig: resolveRoot('jsconfig.json'),
    yarnLockFile: resolveRoot('yarn.lock'),
    appNodeModules: resolveRoot('node_modules'),
    appWebpackCache: resolveRoot('node_modules/.cache'),
    appTsBuildInfoFile: resolveRoot('node_modules/.cache/tsconfig.tsbuildinfo'),
    publicUrlOrPath: '/',
    appRootSrc: resolveRoot('src'),
    appRootPath: resolveRoot('.'),
    oakConfigJson: resolveApp('src/oak.config.json'),
    oakGeneralBusinessPath: resolveRoot(
        'node_modules/oak-general-business/' +
            (process.env.NODE_ENV !== 'production' ? 'src' : 'es')
    ),
    oakFrontendBasePath: resolveRoot(
        'node_modules/oak-frontend-base/' +
            (process.env.NODE_ENV !== 'production' ? 'src' : 'es')
    ),
    oakAppDomainPath: resolveRoot('src/oak-app-domain'),
};



module.exports.moduleFileExtensions = moduleFileExtensions;
