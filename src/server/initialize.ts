/// <reference path="../typings/polyfill.d.ts" />
import { AppLoader } from 'oak-backend-base';
import { Context, EntityDict, RowStore } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { MySQLConfiguration } from 'oak-db/lib/MySQL/types/Configuration';

export async function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>>(
    path: string,
    contextBuilder: (scene?: string) => (store: RowStore<ED, Cxt>) => Promise<Cxt>,
    dbConfig: MySQLConfiguration,
    dropIfExists?: boolean) {
    const appLoader = new AppLoader(path, contextBuilder, dbConfig);
    await appLoader.mount(true);
    await appLoader.initialize(dropIfExists);
    await appLoader.unmount();
    console.log('data initialized');
}