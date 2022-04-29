"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oakConfigContentWithWeChatMp = exports.appJsonContentWithWeChatMp = exports.projectConfigContentWithWeChatMp = exports.tsConfigJsonContent = exports.packageJsonContent = void 0;
function packageJsonContent({ name, version, description, cliversion, cliname, isDev, }) {
    let oakPackageStr;
    if (isDev) {
        oakPackageStr = `"${cliname}": "file:../${cliname}",
        "oak-domain": "file:../oak-domain",
        "oak-frontend-base": "file:../oak-frontend-base",
        "oak-general-business": "file:../oak-general-business",
        "oak-memory-tree-store": "file:../oak-memory-tree-store",`;
    }
    else {
        oakPackageStr = `"${cliname}": "^${cliversion}",
        "oak-domain": "^1.0.0",
        "oak-frontend-base": "^1.0.0",
        "oak-general-business": "^1.0.0",
        "oak-memory-tree-store": "^1.0.0",`;
    }
    return `{
    "name": "${name}",
    "version": "${version}",
    "description": "${description}",
    "scripts": {
        "make:domain": "${cliname} make",
        "start:mp": "${cliname} start --target mp --mode development",
        "build:mp": "${cliname} build --target mp --mode production"
    },
    "keywords": [],
    "author": "",
    "license": "",
    "dependencies": {
        "@reduxjs/toolkit": "^1.7.2",
        "crypto-browserify": "^3.12.0",
        "lodash": "^4.17.21",
        "uuid": "^8.3.2"
    },
    "devDependencies": {
        "@babel/cli": "^7.12.13",
        "@babel/core": "^7.12.13",
        "@babel/plugin-proposal-class-properties": "^7.12.13",
        "@babel/preset-env": "^7.12.13",
        "@babel/preset-typescript": "^7.12.13",
        "@types/assert": "^1.5.6",
        "@types/fs-extra": "^9.0.13",
        "@types/lodash": "^4.14.179",
        "@types/mocha": "^8.2.0",
        "@types/node": "^14.14.25",
        "@types/react": "^17.0.2",
        "@types/shelljs": "^0.8.11",
        "@types/uuid": "^8.3.0",
        "@types/wechat-miniprogram": "^3.4.0",
        "assert": "^2.0.0",
        "babel-loader": "^8.2.3",
        "chalk": "^4.1.2",
        "clean-webpack-plugin": "^4.0.0",
        "copy-webpack-plugin": "^10.2.4",
        "cross-env": "^7.0.2",
        "css-loader": "^6.6.0",
        "dotenv-webpack": "^7.1.0",
        "ensure-posix-path": "^1.1.1",
        "file-loader": "^6.2.0",
        "fs-extra": "^10.0.0",
        "globby": "^11.1.0",
        "less": "^4.1.2",
        "less-loader": "^10.2.0",
        "mini-css-extract-plugin": "^2.5.3",
        "miniprogram-api-typings": "^3.4.5",
        "mocha": "^8.2.1",
        ${oakPackageStr}
        "postcss-less": "^6.0.0",
        "progress": "^2.0.3",
        "progress-bar-webpack-plugin": "^2.1.0",
        "required-path": "^1.0.1",
        "shelljs": "^0.8.5",
        "style-loader": "^3.3.1",
        "stylelint-config-standard": "^25.0.0",
        "stylelint-webpack-plugin": "^3.1.1",
        "ts-loader": "^9.2.6",
        "ts-node": "^9.1.1",
        "typescript": "^4.5.2",
        "ui-extract-webpack-plugin": "^1.0.0",
        "webpack": "^5.69.1",
    }
}
`;
}
exports.packageJsonContent = packageJsonContent;
function tsConfigJsonContent() {
    return `{
   "compilerOptions": {
    "module": "CommonJS",
    "target": "esnext",
    "allowJs": false,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "strict": true,
    "lib": [
      "ES2020"
    ],
    "typeRoots": [
      "./src/typings"
    ],
    "types": [
      "node",
      "miniprogram-api-typings"
    ],
    "resolveJsonModule": true /* Disallow inconsistently-cased references to the same file. */
  },
  "include": [
    "./**/*.ts",
  ],
  "exclude": [
    "node_modules"
  ]
}`;
}
exports.tsConfigJsonContent = tsConfigJsonContent;
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
        pages.push("@oak-general-business/token/login/index");
        pages.push('@oak-general-business/address/list/index');
        pages.push('@oak-general-business/address/upsert/index');
        pages.push('@oak-general-business/pickers/area/index');
    }
    else {
        pages.push('pages/index/index');
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
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}`;
}
exports.appJsonContentWithWeChatMp = appJsonContentWithWeChatMp;
function oakConfigContentWithWeChatMp() {
    return `{
    "theme": {
        "@primary-color": "#2d8cf0"
    }
}`;
}
exports.oakConfigContentWithWeChatMp = oakConfigContentWithWeChatMp;
