/// <reference path="../typings/polyfill.d.ts" />
import './polyfill';
import { createServer } from "http";
import PathLib from 'path';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import KoaBody from 'koa-body';
import { AppLoader } from 'oak-backend-base';
import { OakException, Connector, EntityDict, EndpointItem, RowStore } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext, AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/cluster-adapter";
import { setupWorker } from "@socket.io/sticky";

const DATA_SUBSCRIBER_NAMESPACE = '/ds';
export async function startup<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>>(
    path: string,
    contextBuilder: (scene?: string) => (store: AsyncRowStore<ED, Cxt>) => Promise<Cxt>,
    connector: Connector<ED, FrontCxt>,
    omitWatchers?: boolean,
    omitTimers?: boolean,
    routine?: (context: Cxt) => Promise<void>,
) {
    const koa = new Koa();
    // socket
    const httpServer = createServer(koa.callback());
    const socketOption: any = {
        path: connector.getSubscribeRouter(),
    };
    socketOption.cors = {
        origin: '*',        // 允许跨域访问
        allowedHeaders: ["oak-cxt"],
    };
    const io = new Server(httpServer, socketOption);
    if (process.env.PM2_STATUS) {
        // pm2环境下要接入clusterAdapter
        // https://socket.io/zh-CN/docs/v4/pm2/
        io.adapter(createAdapter());
        setupWorker(io);        
    }

    const appLoader = new AppLoader(path, contextBuilder, io.of(DATA_SUBSCRIBER_NAMESPACE));
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
            const exception = err instanceof OakException ? err : new OakException('内部不可知错误');
            const { body } = connector.serializeException(exception, request.headers, request.body);
            ctx.response.body = body;
            return;
        }
    })
    koa.use(KoaBody({
        multipart: true,
    }));
    const router = new KoaRouter();

    const serverConfig = require(PathLib.join(path, '/configuration/server.json'));
    // 如果是开发环境，允许options
    if (process.env.NODE_ENV === 'development') {
        koa.use(async (ctx, next) => {
            ctx.set('Access-Control-Allow-Origin', '*');
            ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With, oak-cxt, oak-aspect');
            ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            if (ctx.method == 'OPTIONS') {
                ctx.body = 200;
            } else {
                await next();
            }
        });
    }

    router.post(connector.getRouter(), async (ctx) => {
        const { request } = ctx;
        const data = request.files ? Object.assign({}, request.body, request.files) : request.body;     // 这里处理multiPart的文件，不是太好
        const { contextString, aspectName } = connector.parseRequestHeaders(request.headers);
        
        const { result, opRecords, message } = await appLoader.execAspect(aspectName, contextString, data);
        const { body, headers } = await connector.serializeResult(result, opRecords, request.headers, request.body, message);
        ctx.response.body = body;
        return;
    });

    // 桥接访问外部资源的入口
    router.get(connector.getBridgeRouter(), async (ctx) => {
        const { request: { querystring }, response } = ctx;
        const { url, headers } = connector.parseBridgeRequestQuery(querystring);

        // headers待处理
        const res = await fetch(url as string);
        response.body = res.body;
        return;
    });

    // 外部socket接口
    router.get(connector.getSubscribePointRouter(), async (ctx) => {
        const { response } = ctx;
        if (process.env.PM2_STATUS) {
            // 如果使用了pm2，则返回 @socket.io/pm2所监听的PM2_PORT端口
            response.body = {
                namespace: DATA_SUBSCRIBER_NAMESPACE,
                path: connector.getSubscribeRouter(),
                port: process.env.PM2_PORT || 8080,
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
    const endpoints = appLoader.getEndpoints();
    endpoints.forEach(
        ([name, method, url, fn]) => {
            router[method](name, url, async (ctx) => {
                const { req, request, params } = ctx;
                const { body, headers } = request;
                try {
                    const result = await fn(params, headers, req, body);
                    ctx.response.body = result;
                    return;
                }
                catch(err) {
                    ctx.response.status = 500;
                    return;
                }
            });
        }
    );
    router.get('/endpoint', async (ctx) => {
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
}