"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
/// <reference path="../typings/polyfill.d.ts" />
const oak_backend_base_1 = require("oak-backend-base");
async function initialize(path, contextBuilder, dropIfExists) {
    const appLoader = new oak_backend_base_1.AppLoader(path, contextBuilder);
    await appLoader.mount(true);
    await appLoader.initialize(dropIfExists);
    await appLoader.unmount();
    console.log('data initialized');
}
exports.initialize = initialize;
