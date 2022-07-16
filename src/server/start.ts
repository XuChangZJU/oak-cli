/// <reference path="../typings/polyfill.d.ts" />
import './polyfill';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import KoaBody from 'koa-body';
import { AppLoader, BackendContext } from 'oak-backend-base';
import { OakException, Connector, EntityDict, Context, RowStore } from 'oak-domain/lib/types';

export async function startup<ED extends EntityDict, Cxt extends Context<ED>>(path: string, contextBuilder: (scene?: string) => (store: RowStore<ED, Cxt>) => Cxt, connector: Connector<ED, Cxt>) {
    const appLoader = new AppLoader(path, contextBuilder);
    await appLoader.mount();
    const koa = new Koa();
    koa.use(KoaBody({
        multipart: true,
    }));
    const router = new KoaRouter();

    // 如果是开发环境，允许options
    if (process.env.NODE_ENV = 'development') {
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
        console.log('aspect called');
        const { request } = ctx;
        const { name, params, context } = connector.parseRequest(request.headers, request.body, appLoader.getStore());
        await context.begin();
        let result: any;
        try {
            result = await appLoader.execAspect(name, context, params);
            await context.commit();
        }
        catch (err: any) {
            await context.rollback();
            console.error(err);
            const exception = err instanceof OakException ? err : new OakException('内部不可知错误');
            const { body } = connector.serializeException(exception, request.headers, request.body);
            ctx.response.body = body;
            return;
        }
        const { body, headers } = connector.serializeResult(result, context, request.headers, request.body);
        ctx.response.body = body;
        return;
    });
    koa.use(router.routes());


    const serverConfig = require(`${path}/configuration/server.json`);
    console.log(`server will listen on port ${serverConfig.port}`);
    koa.on('error', (err) => {
        console.error(err);
        throw err;
    });
    koa.listen(serverConfig.port);
}