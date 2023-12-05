/// <reference path="../../src/typings/polyfill.d.ts" />
/// <reference types="node" />
import './polyfill';
import { IncomingHttpHeaders } from "http";
import { Connector, EntityDict, ClusterInfo } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { BackendRuntimeContext } from 'oak-frontend-base';
import { SyncContext } from 'oak-domain/lib/store/SyncRowStore';
export declare function startup<ED extends EntityDict & BaseEntityDict, Cxt extends BackendRuntimeContext<ED>, FrontCxt extends SyncContext<ED>>(path: string, contextBuilder: (scene?: string) => (store: AsyncRowStore<ED, Cxt>, header?: IncomingHttpHeaders, clusterInfo?: ClusterInfo) => Promise<Cxt>, connector: Connector<ED, FrontCxt>, omitWatchers?: boolean, omitTimers?: boolean, routine?: (context: Cxt) => Promise<void>): Promise<void>;
