"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startup = void 0;
const tslib_1 = require("tslib");
/// <reference path="../typings/polyfill.d.ts" />
require("./polyfill");
const path_1 = tslib_1.__importDefault(require("path"));
const koa_1 = tslib_1.__importDefault(require("koa"));
const koa_router_1 = tslib_1.__importDefault(require("koa-router"));
const koa_body_1 = tslib_1.__importDefault(require("koa-body"));
const oak_backend_base_1 = require("oak-backend-base");
const types_1 = require("oak-domain/lib/types");
async function startup(path, contextBuilder, connector) {
    const dbConfig = require(path_1.default.join(path, '/configuration/mysql.json'));
    const appLoader = new oak_backend_base_1.AppLoader(path, contextBuilder, dbConfig);
    await appLoader.mount();
    const koa = new koa_1.default();
    koa.use(async (ctx, next) => {
        try {
            await next();
        }
        catch (err) {
            console.error(err);
            const { request } = ctx;
            const exception = err instanceof types_1.OakException ? err : new types_1.OakException('内部不可知错误');
            const { body } = connector.serializeException(exception, request.headers, request.body);
            ctx.response.body = body;
            return;
        }
    });
    koa.use((0, koa_body_1.default)({
        multipart: true,
    }));
    const router = new koa_router_1.default();
    // 如果是开发环境，允许options
    if (process.env.NODE_ENV === 'development') {
        koa.use(async (ctx, next) => {
            ctx.set('Access-Control-Allow-Origin', '*');
            ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With, oak-cxt, oak-aspect');
            ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            if (ctx.method == 'OPTIONS') {
                ctx.body = 200;
            }
            else {
                await next();
            }
        });
    }
    router.post(connector.getRouter(), async (ctx) => {
        console.log('aspect called');
        const { request } = ctx;
        const { name, params, context } = await connector.parseRequest(request.headers, request.body, appLoader.getStore());
        await context.begin();
        let result;
        try {
            result = await appLoader.execAspect(name, context, params);
            await context.commit();
        }
        catch (err) {
            await context.rollback();
            throw err;
        }
        const { body, headers } = connector.serializeResult(result, context, request.headers, request.body);
        ctx.response.body = body;
        return;
    });
    koa.use(router.routes());
    const serverConfig = require(path_1.default.join(path, '/configuration/server.json'));
    console.log(`server will listen on port ${serverConfig.port}`);
    koa.on('error', (err) => {
        console.error(err);
        throw err;
    });
    koa.listen(serverConfig.port);
}
exports.startup = startup;
