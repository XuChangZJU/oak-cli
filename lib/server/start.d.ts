/// <reference path="../../src/typings/polyfill.d.ts" />
import './polyfill';
import { Connector, EntityDict, Context, RowStore } from 'oak-domain/lib/types';
export declare function startup<ED extends EntityDict, Cxt extends Context<ED>>(path: string, contextBuilder: (scene?: string) => (store: RowStore<ED, Cxt>) => Cxt, connector: Connector<ED, Cxt>): Promise<void>;
