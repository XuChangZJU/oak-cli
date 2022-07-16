/// <reference path="../typings/polyfill.d.ts" />
import { AppLoader } from 'oak-backend-base';
import { Context, EntityDict, RowStore } from 'oak-domain/lib/types';

export async function initialize<ED extends EntityDict, Cxt extends Context<ED>>(path: string, contextBuilder: (scene?: string) => (store: RowStore<ED, Cxt>) => Cxt, dropIfExists?: boolean) {
    const appLoader = new AppLoader(path, contextBuilder);
    await appLoader.mount();
    await appLoader.initialize(dropIfExists);
    await appLoader.unmount();
    console.log('data initialized');
}