"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startup = void 0;
const tslib_1 = require("tslib");
/// <reference path="../typings/polyfill.d.ts" />
require("./polyfill");
const http_1 = require("http");
const path_1 = tslib_1.__importDefault(require("path"));
const koa_1 = tslib_1.__importDefault(require("koa"));
const koa_router_1 = tslib_1.__importDefault(require("koa-router"));
const koa_body_1 = tslib_1.__importDefault(require("koa-body"));
const oak_backend_base_1 = require("oak-backend-base");
const types_1 = require("oak-domain/lib/types");
const socket_io_1 = require("socket.io");
const cluster_adapter_1 = require("@socket.io/cluster-adapter");
const sticky_1 = require("@socket.io/sticky");
const DATA_SUBSCRIBER_NAMESPACE = '/ds';
async function startup(path, contextBuilder, connector, omitWatchers, omitTimers, routine) {
    const koa = new koa_1.default();
    // socket
    const httpServer = (0, http_1.createServer)(koa.callback());
    const socketOption = {
        path: connector.getSubscribeRouter(),
    };
    socketOption.cors = {
        origin: '*',
        allowedHeaders: ["oak-cxt"],
    };
    const io = new socket_io_1.Server(httpServer, socketOption);
    const clusterInfo = (0, oak_backend_base_1.getClusterInfo)();
    if (clusterInfo.usingCluster) {
        // 目前只支持单物理结点的pm2模式
        // pm2环境下要接入clusterAdapter
        // https://socket.io/zh-CN/docs/v4/pm2/
        io.adapter((0, cluster_adapter_1.createAdapter)());
        (0, sticky_1.setupWorker)(io);
        console.log(`以集群模式启动，实例总数『${clusterInfo.instanceCount}』，当前实例号『${clusterInfo.instanceId}』`);
    }
    else {
        console.log('以单实例模式启动');
    }
    const appLoader = clusterInfo.usingCluster ? new oak_backend_base_1.ClusterAppLoader(path, contextBuilder, io.of(DATA_SUBSCRIBER_NAMESPACE)) : new oak_backend_base_1.AppLoader(path, contextBuilder, io.of(DATA_SUBSCRIBER_NAMESPACE));
    await appLoader.mount();
    await appLoader.execStartRoutines();
    if (routine) {
        // 如果传入了routine，执行完成后就结束
        await appLoader.execRoutine(routine);
        return;
    }
    // 否则启动服务器模式
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
    const serverConfig = require(path_1.default.join(path, '/configuration/server.json'));
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
        const { request } = ctx;
        const data = request.files ? Object.assign({}, request.body, request.files) : request.body; // 这里处理multiPart的文件，不是太好
        const { contextString, aspectName } = connector.parseRequestHeaders(request.headers);
        const { result, opRecords, message } = await appLoader.execAspect(aspectName, request.headers, contextString, data);
        const { body, headers } = await connector.serializeResult(result, opRecords, request.headers, request.body, message);
        ctx.response.body = body;
        return;
    });
    // 桥接访问外部资源的入口
    router.get(connector.getBridgeRouter(), async (ctx) => {
        const { request: { querystring }, response } = ctx;
        const { url, headers } = connector.parseBridgeRequestQuery(querystring);
        // headers待处理
        const res = await fetch(url);
        response.body = res.body;
        return;
    });
    // 外部socket接口
    router.get(connector.getSubscribePointRouter(), async (ctx) => {
        const { response } = ctx;
        if (clusterInfo.usingCluster) {
            // 如果使用了pm2，则返回 @socket.io/pm2所监听的PM2_PORT端口
            response.body = {
                namespace: DATA_SUBSCRIBER_NAMESPACE,
                path: connector.getSubscribeRouter(),
                // 如果是开发环境就直连@socket.io/pm2的监听端口
                port: process.env.NODE_ENV === 'development' ? (process.env.PM2_PORT || 8080) : serverConfig.port,
            };
            // 开发环境socket直接连接
            return;
        }
        else {
            // 不使用pm2则监听在http服务器端口上
            response.body = {
                namespace: DATA_SUBSCRIBER_NAMESPACE,
                path: connector.getSubscribeRouter(),
                port: serverConfig.port,
            };
            return;
        }
    });
    // 注入所有的endpoints
    const endpoints = appLoader.getEndpoints(connector.getEndpointRouter());
    endpoints.forEach(([name, method, url, fn]) => {
        router[method](url, async (ctx) => {
            const { req, request, params } = ctx;
            const { body, headers } = request;
            try {
                const result = await fn(params, headers, req, body);
                ctx.response.body = result;
                return;
            }
            catch (err) {
                ctx.response.status = 500;
                return;
            }
        });
    });
    router.get(connector.getEndpointRouter(), async (ctx) => {
        ctx.response.body = endpoints;
    });
    koa.use(router.routes());
    console.log(`server will listen on port ${serverConfig.port}`);
    koa.on('error', (err) => {
        console.error(err);
        throw err;
    });
    httpServer.listen(serverConfig.port);
    if (!omitWatchers) {
        appLoader.startWatchers();
    }
    if (!omitTimers) {
        appLoader.startTimers();
    }
    process.on('SIGINT', async () => {
        await appLoader.unmount();
        process.exit(0);
    });
}
exports.startup = startup;
