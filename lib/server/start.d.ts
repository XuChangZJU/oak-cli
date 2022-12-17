/// <reference path="../../src/typings/polyfill.d.ts" />
import './polyfill';
import { Connector, EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext, AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
export declare function startup<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>, FrontCxt extends SyncContext<ED>>(path: string, contextBuilder: (scene?: string) => (store: AsyncRowStore<ED, Cxt>) => Promise<Cxt>, connector: Connector<ED, Cxt, FrontCxt>, omitWatchers?: boolean, omitTimers?: boolean): Promise<void>;
