/// <reference path="../typings/polyfill.d.ts" />
import PathLib from 'path';
import { AppLoader } from 'oak-backend-base';
import { Context, EntityDict, RowStore } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext, AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';

export async function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>>(
    path: string,
    contextBuilder: (scene?: string) => (store: AsyncRowStore<ED, Cxt>) => Promise<Cxt>,
    dropIfExists?: boolean) {
    const appLoader = new AppLoader(path, contextBuilder);
    await appLoader.mount(true);
    await appLoader.initialize(dropIfExists);
    await appLoader.unmount();
    console.log('data initialized');
}