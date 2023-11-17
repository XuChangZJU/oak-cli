/// <reference path="../typings/polyfill.d.ts" />
import { AppLoader } from 'oak-backend-base';
import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { BackendRuntimeContext } from 'oak-frontend-base';
import { IncomingHttpHeaders } from 'http';

export async function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends BackendRuntimeContext<ED>>(
    path: string,
    contextBuilder: (scene?: string) => (store: AsyncRowStore<ED, Cxt>, headers?: IncomingHttpHeaders) => Promise<Cxt>,
    dropIfExists?: boolean) {
    const appLoader = new AppLoader(path, contextBuilder);
    await appLoader.mount(true);
    await appLoader.initialize(dropIfExists);
    await appLoader.unmount();
    console.log('data initialized');
}