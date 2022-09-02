/// <reference path="../../src/typings/polyfill.d.ts" />
import './polyfill';
import { Connector, EntityDict, Context, RowStore } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { MySQLConfiguration } from 'oak-db/lib/MySQL/types/Configuration';
export declare function startup<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>>(path: string, contextBuilder: (scene?: string) => (store: RowStore<ED, Cxt>) => Cxt, dbConfig: MySQLConfiguration, connector: Connector<ED, Cxt>): Promise<void>;
