/// <reference path="../../src/typings/polyfill.d.ts" />
import { Context, EntityDict, RowStore } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { MySQLConfiguration } from 'oak-db/lib/MySQL/types/Configuration';
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>>(path: string, contextBuilder: (scene?: string) => (store: RowStore<ED, Cxt>) => Promise<Cxt>, dbConfig: MySQLConfiguration, dropIfExists?: boolean): Promise<void>;
