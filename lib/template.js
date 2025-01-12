"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oakConfigContentWithWeb = exports.oakConfigContentWithWeChatMp = exports.appJsonContentWithWeChatMp = exports.projectConfigContentWithWeChatMp = exports.tsConfigWebJsonContent = exports.tsConfigMpJsonContent = exports.tsConfigPathsJsonContent = exports.tsConfigBuildPathsJsonContent = exports.tsConfigBuildJsonContent = exports.tsConfigJsonContent = exports.packageJsonContent = void 0;
const child_process_1 = require("child_process");
/**
 * 利用npm info获得相应库的最新版本
 * @param name
 * @returns
 */
function getPackageLatestVersion(name) {
    const result = (0, child_process_1.execSync)(`npm info ${name}`).toString('utf-8');
    const data = result.match(/latest: \d\.\d\.\d\s*published/g);
    return data[0].slice(8, 13);
}
function packageJsonContent({ name, version, description, cliName, cliBinName, isDev, }) {
    let oakDependencyStr;
    let oakDevDependencyStr;
    if (isDev) {
        oakDependencyStr = `
        "oak-backend-base": "file:../oak-backend-base",
        "oak-common-aspect": "file:../oak-common-aspect",
        "oak-db": "file:../oak-db",
        "oak-domain": "file:../oak-domain",
        "oak-external-sdk": "file:../oak-external-sdk",
        "oak-frontend-base": "file:../oak-frontend-base",
        "oak-general-business": "file:../oak-general-business",
        "oak-memory-tree-store": "file:../oak-memory-tree-store",`;
        oakDevDependencyStr = `"${cliName}": "file:../oak-cli",`;
    }
    else {
        // todo，这里从npmjs.org上获取最新版本
        oakDependencyStr = `
        "oak-backend-base": "^${getPackageLatestVersion('oak-backend-base')}",
        "oak-common-aspect": "^${getPackageLatestVersion('oak-common-aspect')}",
        "oak-db": "^${getPackageLatestVersion('oak-db')}",
        "oak-domain": "^${getPackageLatestVersion('oak-domain')}",
        "oak-external-sdk": "^${getPackageLatestVersion('oak-external-sdk')}",
        "oak-frontend-base": "^${getPackageLatestVersion('oak-frontend-base')}",
        "oak-general-business": "^${getPackageLatestVersion('oak-general-business')}",
        "oak-memory-tree-store": "^${getPackageLatestVersion('oak-memory-tree-store')}",`;
        oakDevDependencyStr = `"${cliName}": "^${getPackageLatestVersion(cliName)}",`;
    }
    const serverInitScript = isDev ? "cross-env NODE_ENV=development cross-env OAK_PLATFORM=server node scripts/initServer.js" : "cross-env OAK_PLATFORM=server node scripts/initServer.js";
    const serverStartScript = isDev ? "cross-env NODE_ENV=development cross-env OAK_PLATFORM=server node scripts/startServer.js" : "cross-env OAK_PLATFORM=server node scripts/startServer.js";
    return `{
    "name": "${name}",
    "version": "${version}",
    "description": "${description}",
    "scripts": {
       	"make:domain": "${cliBinName} make:domain",
        "make:locale": "${cliBinName} make:locale",
        "clean:cache": "rimraf node_modules/.cache",
        "copy-config-json": "copyfiles -u 1 src/config/*.json lib/",
        "start:mp": "${cliBinName} start --target mp --mode development",
        "start:mp:prod": "${cliBinName} start --target mp --mode development --prod",
        "build:mp:staging": "${cliBinName} build --target mp --mode staging",
        "build-analyze:mp:staging": "${cliBinName} build --target mp --mode staging --analyze",
        "build:mp": "${cliBinName} build --target mp --mode production",
        "build-analyze:mp": "${cliBinName} build --target mp --mode production --analyze",
        "start:web": "${cliBinName} start --target web --mode development",
        "start:web:prod": "${cliBinName} start --target web --mode development --prod",
        "start:native": "${cliBinName} start --target rn --mode development",
        "start:native:prod": "${cliBinName} start --target rn --mode development --prod",
        "build:web:staging": "${cliBinName} build --target web --mode staging",
        "build-analyze:web:staging": "${cliBinName} build --target web --mode staging --analyze",
        "build:web": "${cliBinName} build --target web --mode production",
        "build-analyze:web": "${cliBinName} build --target web --mode production --analyze",
        "build-sourcemap-analyze:web": "${cliBinName} build --target web --mode production --sourcemap --analyze",
        "build": "tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json && npm run copy-config-json",
        "run:ios": "oak-cli run -p ios",
        "run:android": "oak-cli run -p android",
        "server:init": "${serverInitScript}",
        "server:start": "${serverStartScript}",
        "postinstall": "npm run make:domain"
    },
    "keywords": [],
    "author": "",
    "license": "",
    "typings": "typings/index.d.ts",
    "dependencies": {
		"@ant-design/cssinjs": "^1.16.2",
		"@ant-design/icons": "^5.2.6",
    "@react-native-async-storage/async-storage": "^1.19.8",
    "@react-native-masked-view/masked-view": "^0.3.0",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
		"@wangeditor/basic-modules": "^1.1.3",
		"@wangeditor/editor": "^5.1.14",
		"@wangeditor/editor-for-react": "^1.0.4",
		"antd": "^5.8.3",
		"antd-mobile": "^5.32.0",
		"antd-mobile-icons": "^0.3.0",
		"classnames": "^2.3.1",
		"crypto-browserify": "^3.12.0",
		"crypto-js": "^4.1.1",
		"dayjs": "^1.11.5",
		"echarts": "^5.3.0",
		"echarts-for-react": "^3.0.2",
		"history": "^5.3.0",
		"hmacsha1": "^1.0.0",
		"js-base64": "^3.7.2",
		"lodash": "^4.17.21",
		"nprogress": "^0.2.0",
		${oakDependencyStr}
		"react": "^18.2.0",		
		"react-dom": "^18.1.0",
		"react-image-gallery": "^1.2.11",
		"react-native": "0.72.7",
    "react-native-exception-handler": "^2.10.10",
    "react-native-gesture-handler": "^2.14.0",
    "react-native-localize": "^3.0.4",
    "react-native-quick-base64": "^2.0.7",
    "react-native-quick-crypto": "^0.6.1",
    "react-native-reanimated": "^3.5.4",
    "react-native-safe-area-context": "^4.7.4",
    "react-native-screens": "^3.27.0",
    "react-native-url-polyfill": "^2.0.0",
		"react-responsive": "^9.0.0-beta.10",
		"react-router-dom": "^6.4.0",
		"react-slick": "^0.29.0",
		"rmc-pull-to-refresh": "^1.0.13",
		"slick-carousel": "^1.8.1",
		"uuid": "^8.3.2"
    },
    "devDependencies": {
		"@babel/cli": "^7.12.13",
		"@babel/core": "^7.12.13",
		"@babel/plugin-proposal-class-properties": "^7.12.13",
    "@babel/plugin-proposal-private-property-in-object": "^7.21.11",
		"@babel/preset-env": "^7.12.13",
		"@babel/preset-typescript": "^7.12.13",
		"@pmmmwh/react-refresh-webpack-plugin": "^0.5.3",
		"@react-native/metro-config": "^0.72.11",
		"@svgr/webpack": "^5.5.0",
		"@testing-library/jest-dom": "^5.16.4",
		"@testing-library/react": "^13.3.0",
		"@testing-library/user-event": "^13.5.0",
		"@tsconfig/react-native": "^3.0.0",
		"@types/assert": "^1.5.6",
		"@types/crypto-js": "^4.1.1",
		"@types/fs-extra": "^9.0.13",
		"@types/isomorphic-fetch": "^0.0.36",
		"@types/jest": "^27.5.2",
		"@types/lodash": "^4.14.179",
		"@types/luxon": "^2.3.2",
		"@types/mocha": "^8.2.0",
		"@types/node": "^20.10.2",
		"@types/nprogress": "^0.2.0",
		"@types/react": "^18.0.12",
		"@types/react-dom": "^18.0.5",
		"@types/react-image-gallery": "^1.2.0",
		"@types/shelljs": "^0.8.11",
		"@types/urlsafe-base64": "^1.0.28",
		"@types/uuid": "^8.3.0",
		"@types/wechat-miniprogram": "^3.4.0",
        ${oakDevDependencyStr}
        "assert": "^2.0.0",
        "babel-jest": "^27.4.2",
        "babel-loader": "^8.2.3",
        "babel-plugin-named-asset-import": "^0.3.8",
        "babel-plugin-module-resolver": "^5.0.0",
        "babel-preset-react-app": "^10.0.1",
        "bfj": "^7.0.2",
        "browserify-zlib": "^0.2.0",
        "browserslist": "^4.18.1",
        "camelcase": "^6.2.1",
        "case-sensitive-paths-webpack-plugin": "^2.4.0",
        "chalk": "^4.1.2",
        "clean-webpack-plugin": "^4.0.0",
        "copy-webpack-plugin": "^10.2.4",
        "copyfiles": "^2.4.1",
        "cross-env": "^7.0.3",
        "css-loader": "^6.6.0",
        "css-minimizer-webpack-plugin": "^3.2.0",
        "dotenv": "^10.0.0",
        "dotenv-expand": "^5.1.0",
        "dotenv-webpack": "^7.1.0",
        "ensure-posix-path": "^1.1.1",
        "eslint": "^8.3.0",
        "eslint-config-react-app": "^7.0.1",
        "eslint-webpack-plugin": "^3.1.1",
        "file-loader": "^6.2.0",
        "fs-extra": "^10.0.0",
        "globby": "^11.1.0",
        "html-webpack-plugin": "^5.5.0",
        "identity-obj-proxy": "^3.0.0",
        "jest": "^27.4.3",
        "jest-resolve": "^27.4.2",
        "jest-watch-typeahead": "^1.0.0",
        "less": "^4.1.2",
        "less-loader": "^10.2.0",
		    "metro-react-native-babel-preset": "0.76.8",
        "mini-css-extract-plugin": "^2.5.3",
        "miniprogram-api-typings": "^3.4.5",
        "mocha": "^8.2.1",
        "postcss": "^8.4.4",
        "postcss-flexbugs-fixes": "^5.0.2",
        "postcss-less": "^6.0.0",
        "postcss-loader": "^6.2.1",
        "postcss-normalize": "^10.0.1",
        "postcss-preset-env": "^7.0.1",
        "progress": "^2.0.3",
        "progress-bar-webpack-plugin": "^2.1.0",
        "prompts": "^2.4.2",
        "react-app-polyfill": "^3.0.0",
        "react-dev-utils": "^12.0.1",
        "react-refresh": "^0.11.0",
        "required-path": "^1.0.1",
        "resolve": "^1.20.0",
        "resolve-url-loader": "^4.0.0",
        "sass-loader": "^12.3.0",
        "semver": "^7.3.5",
        "shelljs": "^0.8.5",
        "source-map-loader": "^3.0.0",
        "style-loader": "^3.3.1",
        "stylelint": "^14.4.0",
        "stylelint-config-standard": "^25.0.0",
        "stylelint-webpack-plugin": "^3.1.1",
        "tailwindcss": "^3.0.2",
        "terser-webpack-plugin": "^5.2.5",
        "ts-loader": "^9.3.0",
        "ts-node": "^10.9.1",
        "tsc-alias": "^1.8.2",
        "tslib": "^2.4.0",
        "typescript": "^5.2.2",
        "ui-extract-webpack-plugin": "^1.0.0",
        "web-vitals": "^2.1.4",
        "webpack": "^5.86.0",
        "webpack-dev-server": "^4.15.1",
        "webpack-manifest-plugin": "^4.0.2",
        "workbox-webpack-plugin": "^6.4.1"
    },
    "browserslist": {
        "production": [
            ">0.2%",
            "not dead",
            "not op_mini all"
        ],
        "development": [
            "last 1 chrome version",
            "last 1 firefox version",
            "last 1 safari version"
        ]
    },
    "copyWebpack": []
}
`;
}
exports.packageJsonContent = packageJsonContent;
function tsConfigJsonContent() {
    return `{
  "extends": "./tsconfig.paths.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "commonjs",
    "target": "es5",
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,   
    "skipLibCheck": true,
    "strict": true,
    "importHelpers": true,
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    //"outDir": "lib", /* Redirect output structure to the directory. */
    //"rootDir": "src", /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    "types": [
      "node",
      "wechat-miniprogram"
    ],
    "resolveJsonModule": true
  },
  "include": [
    "./src/**/*.js",
    "./src/**/*.ts",
    "./src/**/*.tsx",
    "./web/src/**/*.ts",
    "./web/src/**/*.tsx",
    "./wechatMp/src/**/*.js",
    "./wechatMp/src/**/*.ts",
    "./typings/*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "**/*.spec.ts",
    "test",
    "scripts",
    "lib"
  ]
}`;
}
exports.tsConfigJsonContent = tsConfigJsonContent;
function tsConfigBuildJsonContent() {
    return `{
   "extends": "./tsconfig.build.paths.json",
   "compilerOptions": {
     "jsx": "react-jsx",
    "module": "commonjs",
    "target": "esnext",
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,   
    "skipLibCheck": true,
    "strict": true,
    "importHelpers": true,
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "outDir": "lib", /* Redirect output structure to the directory. */
    "rootDir": "src", /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    // "types": [
    //   "node",
    //   "wechat-miniprogram"
    // ],
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "**/*.spec.ts",
    "test",
    "src/pages/**/*",
    "src/components/**/*"
  ]
}`;
}
exports.tsConfigBuildJsonContent = tsConfigBuildJsonContent;
function tsConfigBuildPathsJsonContent() {
    return `{
    "compilerOptions": {
        "baseUrl": "./",
            "paths": {
            "@project/*": [
                "src/*"
            ],
            "@oak-app-domain": [
                "src/oak-app-domain/index"
            ],
            "@oak-app-domain/*": [
                "src/oak-app-domain/*"
            ],
            "@oak-general-business": [
                "node_modules/oak-general-business/lib/index"
            ],
            "@oak-general-business/*": [
                "node_modules/oak-general-business/lib/*"
            ],
            "@oak-frontend-base": [
                "node_modules/oak-frontend-base/lib/index"
            ],
            "@oak-frontend-base/*": [
                "node_modules/oak-frontend-base/lib/*"
            ],
        },
        "typeRoots": ["./typings"]
    }
}`;
}
exports.tsConfigBuildPathsJsonContent = tsConfigBuildPathsJsonContent;
function tsConfigPathsJsonContent() {
    return `{
    "compilerOptions": {
        "baseUrl": "./",
         "paths": {
            "@project/*": [
                "src/*"
            ],
            "@oak-app-domain": [
                "src/oak-app-domain/index"
            ],
            "@oak-app-domain/*": [
                "src/oak-app-domain/*"
            ],
            "@oak-general-business": [
                "node_modules/oak-general-business/es/index"
            ],
            "@oak-general-business/*": [
                "node_modules/oak-general-business/es/*"
            ],
            "@oak-frontend-base": [
                "node_modules/oak-frontend-base/es/index"
            ],
            "@oak-frontend-base/*": [
                "node_modules/oak-frontend-base/es/*"
            ],
        },
        "typeRoots": ["./typings"]
    }
}`;
}
exports.tsConfigPathsJsonContent = tsConfigPathsJsonContent;
function tsConfigMpJsonContent() {
    return `{
    "extends": "./tsconfig.paths.json",
   "compilerOptions": {
    "module": "ESNext",
    "target": "ESNext",
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "strict": true,
    "downlevelIteration": true,
    "importHelpers": true,
    "moduleResolution": "Node",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    // "outDir": "lib", /* Redirect output structure to the directory. */
    // "rootDir": "src", /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    "types": [
      "node",
      "wechat-miniprogram"
    ],
    "resolveJsonModule": true,
    "jsx": "react"
  },
  "include": [
    "./src/**/*.js",
    "./src/**/*.ts",
    "./wechatMp/src/**/*.js",
    "./wechatMp/src/**/*.ts",
    "./typings/*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "scripts",
    "test",
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/*.test.tsx",
    "./web",
    "./native"
  ]
}`;
}
exports.tsConfigMpJsonContent = tsConfigMpJsonContent;
function tsConfigWebJsonContent() {
    return `{
  "extends": "./tsconfig.paths.json",
   "compilerOptions": {
    "module": "ESNext",
    "target": "ESNext",
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "strict": true,
    "moduleResolution": "Node",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    // "outDir": "lib", /* Redirect output structure to the directory. */
    // "rootDir": "src", /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    "types": [
      "node",
      "wechat-miniprogram",
      "react"
    ],
    "resolveJsonModule": true,
    "jsx": "react"
  },
  "include": [
    "./src/**/*.js",
    "./src/**/*.ts",
    "./src/**/*.tsx",
    "./web/src/**/*.js",
    "./web/src/**/*.ts",
    "./web/src/**/*.tsx",
    "./typings/*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "scripts",
    "test",
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/*.test.tsx",
    "./wechatMp",
    "./native"
  ]
}`;
}
exports.tsConfigWebJsonContent = tsConfigWebJsonContent;
function projectConfigContentWithWeChatMp(oakConfigName, projectname, miniVersion) {
    return `{
    "description": "项目配置文件",
    "packOptions": {
        "ignore": [{
            "type": "file",
            "value": "${oakConfigName}"
        }]
    },
    "setting": {
        "urlCheck": true,
        "es6": true,
        "enhance": true,
        "postcss": true,
        "preloadBackgroundData": false,
        "minified": true,
        "newFeature": false,
        "coverView": true,
        "nodeModules": true,
        "autoAudits": false,
        "showShadowRootInWxmlPanel": true,
        "scopeDataCheck": false,
        "uglifyFileName": false,
        "checkInvalidKey": true,
        "checkSiteMap": true,
        "uploadWithSourceMap": true,
        "compileHotReLoad": false,
        "babelSetting": {
            "ignore": [],
            "disablePlugins": [],
            "outputPath": ""
        },
        "useIsolateContext": true,
        "useCompilerModule": false,
        "userConfirmedUseCompilerModuleSwitch": false
    },
    "compileType": "miniprogram",
    "libVersion": "${miniVersion}",
    "appid": "wx2f8e15297d3e032c",
    "projectname": "${projectname}",
    "debugOptions": {
        "hidedInDevtools": []
    },
    "scripts": "",
    "isGameTourist": false,
    "simulatorType": "wechat",
    "simulatorPluginLibVersion": {},
    "condition": {
        "search": {
            "current": -1,
            "list": []
        },
        "conversation": {
            "current": -1,
            "list": []
        },
        "game": {
            "current": -1,
            "list": []
        },
        "plugin": {
            "current": -1,
            "list": []
        },
        "gamePlugin": {
            "current": -1,
            "list": []
        },
        "miniprogram": {
            "current": -1,
            "list": []
        }
    }
}`;
}
exports.projectConfigContentWithWeChatMp = projectConfigContentWithWeChatMp;
function appJsonContentWithWeChatMp(isDev) {
    const pages = [
        '@project/pages/store/list/index',
        '@project/pages/store/upsert/index',
        '@project/pages/store/detail/index',
    ];
    return `{
  "pages":${JSON.stringify(pages, null, 4)},
  "window":{
    "backgroundTextStyle":"light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "Weixin",
    "navigationBarTextStyle":"black",    
    "enablePullDownRefresh": true
  },
  "usingComponents": {
    "oak-message": "@oak-frontend-base/components/message/index",
    "oak-debugPanel": "@oak-frontend-base/components/func/debugPanel/index"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}`;
}
exports.appJsonContentWithWeChatMp = appJsonContentWithWeChatMp;
function oakConfigContentWithWeChatMp() {
    return `{
    "theme": {
    }
}`;
}
exports.oakConfigContentWithWeChatMp = oakConfigContentWithWeChatMp;
function oakConfigContentWithWeb() {
    return `{
    "theme": {
    }
}`;
}
exports.oakConfigContentWithWeb = oakConfigContentWithWeb;
