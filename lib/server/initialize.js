"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const tslib_1 = require("tslib");
/// <reference path="../typings/polyfill.d.ts" />
const path_1 = tslib_1.__importDefault(require("path"));
const oak_backend_base_1 = require("oak-backend-base");
async function initialize(path, contextBuilder, dropIfExists) {
    const dbConfig = require(path_1.default.join(path, '/configuration/mysql.json'));
    const appLoader = new oak_backend_base_1.AppLoader(path, contextBuilder, dbConfig);
    await appLoader.mount(true);
    await appLoader.initialize(dropIfExists);
    await appLoader.unmount();
    console.log('data initialized');
}
exports.initialize = initialize;
