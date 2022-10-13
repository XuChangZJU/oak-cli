/// <reference path="../typings/polyfill.d.ts" />
import './polyfill';
import PathLib from 'path';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import KoaBody from 'koa-body';
import { AppLoader } from 'oak-backend-base';
import { OakException, Connector, EntityDict, Context, RowStore } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

export async function startup<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>>(
    path: string,
    contextBuilder: (scene?: string) => (store: RowStore<ED, Cxt>) => Promise<Cxt>,
    connector: Connector<ED, Cxt>) {
    const dbConfig = require(PathLib.join(path, '/configuration/mysql.json'));
    const appLoader = new AppLoader(path, contextBuilder, dbConfig);
    await appLoader.mount();
    const koa = new Koa();
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
        console.log('aspect called');
        const { request } = ctx;
        const { name, params, context } = await connector.parseRequest(request.headers, request.body, appLoader.getStore());
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
        const { body, headers } = connector.serializeResult(result, context, request.headers, request.body);
        ctx.response.body = body;
        return;
    });
    koa.use(router.routes());


    const serverConfig = require(PathLib.join(path, '/configuration/server.json'));
    console.log(`server will listen on port ${serverConfig.port}`);
    koa.on('error', (err) => {
        console.error(err);
        throw err;
    });
    koa.listen(serverConfig.port);
}