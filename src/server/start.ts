/// <reference path="../typings/polyfill.d.ts" />
import './polyfill';
import PathLib from 'path';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import KoaBody from 'koa-body';
import { AppLoader } from 'oak-backend-base';
import { OakException, Connector, EntityDict, EndpointItem, RowStore } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext, AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';

export async function startup<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>>(
    path: string,
    contextBuilder: (scene?: string) => (store: AsyncRowStore<ED, Cxt>) => Promise<Cxt>,
    connector: Connector<ED, Cxt, FrontCxt>,
    omitWatchers?: boolean,
    omitTimers?: boolean,
    routine?: (context: Cxt) => Promise<void>,
) {
    const dbConfig = require(PathLib.join(path, '/configuration/mysql.json'));
    const appLoader = new AppLoader(path, contextBuilder, dbConfig);
    await appLoader.mount();
    await appLoader.execStartRoutines();
    const koa = new Koa();
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
        const { name, params, context } = await connector.parseRequest(request.headers, data, appLoader.getStore());
        await context.begin();
        let result: any;
        try {
            result = await appLoader.execAspect(name, context, params);
            await context.commit();
        }
        catch (err: any) {
            await context.rollback();
            throw err;
        }
        const { body, headers } = await connector.serializeResult(result, context, request.headers, request.body);
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

    // 注入所有的endpoints
    const endpoints = appLoader.getEndpoints();
    const endpointsArray: [string, string, string][] = [];
    for (const ep in endpoints) {
        const useEndpointItem = (item: EndpointItem<ED, Cxt>) => {
            const { method, fn, params, name } = item;
            if (endpointsArray.find(
                ele => ele[0] === ep && ele[1] === method
            )) {
                throw new Error(`endpoint中，url为「${ep}」的方法「${method}」存在重复定义`);
            }
            let url = `/endpoint/${ep}`;
            if (params) {
                for (const p of params) {
                    url += `/:${p}`;
                }
            }
            endpointsArray.push([name, method, url]);
            router[method](name, url, async (ctx) => {
                const { req, request, params } = ctx;
                const { body, headers } = request;
                const context = await contextBuilder()(appLoader.getStore());
                await context.begin();
                try {
                    const result = await fn(context, params, headers, req, body);
                    await context.commit();
                    ctx.response.body = result;
                    return;
                }
                catch(err) {
                    await context.rollback();
                    console.error(`endpoint「${ep}」「${method}」出错`, err);
                    ctx.response.status = 500;
                    return;
                }
            });
        };
        if (endpoints[ep] instanceof Array) {
            (endpoints[ep] as EndpointItem<ED, Cxt>[]).forEach(
                epi => useEndpointItem(epi)
            );
        }
        else {
            useEndpointItem(endpoints[ep] as EndpointItem<ED, Cxt>);
        }
    }
    router.get('/endpoint', async (ctx) => {
        ctx.response.body = endpointsArray;
    });

    koa.use(router.routes());

    const serverConfig = require(PathLib.join(path, '/configuration/server.json'));
    console.log(`server will listen on port ${serverConfig.port}`);
    koa.on('error', (err) => {
        console.error(err);
        throw err;
    });
    koa.listen(serverConfig.port);

    if (!omitWatchers) {
        appLoader.startWatchers();
    }
    if (!omitTimers) {
        appLoader.startTimers();
    }
}