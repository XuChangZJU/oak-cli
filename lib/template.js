"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oakConfigContentWithWeb = exports.appJsonContentWithWeb = exports.oakConfigContentWithWeChatMp = exports.appJsonContentWithWeChatMp = exports.projectConfigContentWithWeChatMp = exports.tsConfigWebJsonContent = exports.tsConfigMpJsonContent = exports.tsConfigPathsJsonContent = exports.tsConfigJsonContent = exports.packageJsonContent = void 0;
function packageJsonContent({ name, version, description, cliVersion, cliName, cliBinName, isDev, }) {
    let oakDependencyStr;
    let oakDevDependencyStr;
    if (isDev) {
        oakDependencyStr = `"oak-common-aspect": "file:../oak-common-aspect",
        "oak-domain": "file:../oak-domain",
        "oak-frontend-base": "file:../oak-frontend-base",
        "oak-external-sdk": "file:../oak-external-sdk",
        "oak-general-business": "file:../oak-general-business",
        "oak-memory-tree-store": "file:../oak-memory-tree-store",`;
        oakDevDependencyStr = `"${cliName}": "file:../oak-cli",`;
    }
    else {
        oakDependencyStr = `"oak-common-aspect": "^1.0.0",
        "oak-domain": "^1.0.0",
        "oak-frontend-base": "^1.0.0",
        "oak-general-business": "^1.0.0",
        "oak-external-sdk": "^1.0.0",
        "oak-memory-tree-store": "^1.0.0",`;
        oakDevDependencyStr = `"${cliName}": "^${cliVersion}",`;
    }
    return `{
    "name": "${name}",
    "version": "${version}",
    "description": "${description}",
    "scripts": {
        "make:domain": "${cliBinName} make",
        "start:mp": "${cliBinName} start --target mp --mode development",
        "build:mp": "${cliBinName} build --target mp --mode production",
        "build-analyze:mp": "${cliBinName} build --target mp --mode production --analyze",
        "start:web": "${cliBinName} start --target web --mode development",
        "build:web": "${cliBinName} build --target web --mode production",
        "build-analyze:web": "${cliBinName} build --target web --mode production --analyze",
        "build": "tsc",
        "server:init": "cross-env NODE_ENV=development; cross-env OAK_PLATFORM=server ts-node scripts/initServer.ts",
        "server:start": "cross-env NODE_ENV=development; cross-env OAK_PLATFORM=server ts-node scripts/startServer.ts",
        "postinstall": "npm run make:domain"
    },
    "keywords": [],
    "author": "",
    "license": "",
    "dependencies": {
        "@reduxjs/toolkit": "^1.7.2",
        "classnames": "^2.3.1",
        "crypto-browserify": "^3.12.0",
        "i18next": "^20.6.1",
        "i18next-browser-languagedetector": "^6.1.4",
        "i18next-chained-backend": "^3.0.2",
        "i18next-http-backend": "^1.4.1",
        "i18next-localstorage-backend": "^3.1.3",
        "i18next-resource-store-loader": "^0.1.2",
        "lodash": "^4.17.21",
        "luxon": "^2.4.0",
        "nprogress": "^0.2.0",
        ${oakDependencyStr}
        "react": "^18.2.0",
        "react-dom": "^18.1.0",
        "react-i18next": "^11.18.0",
        "react-responsive": "^9.0.0-beta.10",
        "react-router-dom": "^6.3.0",
        "react-scripts": "5.0.1",
        "rmc-pull-to-refresh": "^1.0.13",
        "tdesign-icons-react": "^0.1.4",
        "tdesign-mobile-react": "^0.2.0",
        "tdesign-react": "^0.38.0",
        "url": "^0.11.0",
        "uuid": "^8.3.2"
    },
    "devDependencies": {
        "@babel/cli": "^7.12.13",
        "@babel/core": "^7.12.13",
        "@babel/plugin-proposal-class-properties": "^7.12.13",
        "@babel/preset-env": "^7.12.13",
        "@babel/preset-typescript": "^7.12.13",
        "@pmmmwh/react-refresh-webpack-plugin": "^0.5.3",
        "@svgr/webpack": "^5.5.0",
        "@testing-library/jest-dom": "^5.16.4",
        "@testing-library/react": "^13.3.0",
        "@testing-library/user-event": "^13.5.0",
        "@types/assert": "^1.5.6",
        "@types/fs-extra": "^9.0.13",
        "@types/jest": "^27.5.2",
        "@types/lodash": "^4.14.179",
        "@types/luxon": "^2.3.2",
        "@types/mocha": "^8.2.0",
        "@types/node": "^16.11.38",
        "@types/nprogress": "^0.2.0",
        "@types/react": "^18.0.12",
        "@types/react-dom": "^18.0.5",
        "@types/shelljs": "^0.8.11",
        "@types/uuid": "^8.3.0",
        "@types/wechat-miniprogram": "^3.4.0",
        ${oakDevDependencyStr}
        "assert": "^2.0.0",
        "babel-jest": "^27.4.2",
        "babel-loader": "^8.2.3",
        "babel-plugin-named-asset-import": "^0.3.8",
        "babel-preset-react-app": "^10.0.1",
        "bfj": "^7.0.2",
        "browserslist": "^4.18.1",
        "camelcase": "^6.2.1",
        "case-sensitive-paths-webpack-plugin": "^2.4.0",
        "chalk": "^4.1.2",
        "clean-webpack-plugin": "^4.0.0",
        "copy-webpack-plugin": "^10.2.4",
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
        "ts-node": "^10.8.1",
        "typescript": "^4.7.3",
        "ui-extract-webpack-plugin": "^1.0.0",
        "web-vitals": "^2.1.4",
        "webpack": "^5.69.1",
        "webpack-dev-server": "^4.6.0",
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
    "jsx": "preserve",
    "module": "commonjs",
    "target": "es5",
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "importHelpers": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,   
    "skipLibCheck": true,
    "strict": true,
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "outDir": "lib", /* Redirect output structure to the directory. */
    "rootDir": "src", /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    "types": [
      "node",
      "miniprogram-api-typings"
    ],
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "**/*.spec.ts",
    "test"
  ]
}`;
}
exports.tsConfigJsonContent = tsConfigJsonContent;
function tsConfigPathsJsonContent() {
    return `{
    "compilerOptions": {
        "baseUrl": "./",
        "paths": {
            "@project/*": [
                "src/*"
            ],
            "@oak-general-business/*": [
                "node_modules/oak-general-business/app/*"
            ],
        },
    }
}`;
}
exports.tsConfigPathsJsonContent = tsConfigPathsJsonContent;
function tsConfigMpJsonContent() {
    return `{
   "extends": "./tsconfig.paths.json",
   "compilerOptions": {
    "module": "commonjs",
    "target": "es5",
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "importHelpers": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "strict": true,
    "downlevelIteration": true,
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    // "outDir": "lib", /* Redirect output structure to the directory. */
    // "rootDir": "src", /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    "types": [
      "node",
      "miniprogram-api-typings"
    ],
    "resolveJsonModule": true,
    "jsx": "react"
  },
  "include": [
    "./**/*.ts",
    "./**/*.mp.ts"
  ],
  "exclude": [
    "node_modules",
    "./web"
  ]
}`;
}
exports.tsConfigMpJsonContent = tsConfigMpJsonContent;
function tsConfigWebJsonContent() {
    return `{
  "extends": "./tsconfig.paths.json",
   "compilerOptions": {
    "module": "commonjs",
    "target": "es5",
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "importHelpers": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "strict": true,
    
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    // "outDir": "lib", /* Redirect output structure to the directory. */
    // "rootDir": "src", /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    "types": [
      "node",
      "miniprogram-api-typings"
    ],
    "resolveJsonModule": true,
    "jsx": "react"
  },
  "include": [
    "./**/*.ts",
    "./**/*.tsx",
    "./**/*.web.ts",
    "./**/*.web.tsx",
    "./**/*.pc.ts",
    "./**/*.pc.tsx"
  ],
  "exclude": [
    "node_modules",
    "./wechatMp"
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
    const pages = [];
    if (isDev) {
        pages.push("@oak-general-business/pages/token/login/index");
        pages.push('@oak-general-business/pages/address/list/index');
        pages.push('@oak-general-business/pages/address/upsert/index');
        pages.push('@oak-general-business/pages/pickers/area/index');
    }
    else {
        pages.push('@project/pages/index/index');
    }
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
    "oak-message": "@oak-general-business/components/message/index",
    "oak-debugPanel": "@oak-general-business/components/func/debugPanel/index"
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
function appJsonContentWithWeb(isDev) {
    return `{
    "pages": [
        "@project/pages/index/index"
    ]
}
`;
}
exports.appJsonContentWithWeb = appJsonContentWithWeb;
function oakConfigContentWithWeb() {
    return `{
    "theme": {
    }
}`;
}
exports.oakConfigContentWithWeb = oakConfigContentWithWeb;
