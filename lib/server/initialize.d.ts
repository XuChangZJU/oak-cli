/// <reference path="../../src/typings/polyfill.d.ts" />
/// <reference types="node" />
import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
import { BackendRuntimeContext } from 'oak-frontend-base';
import { IncomingHttpHeaders } from 'http';
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends BackendRuntimeContext<ED>>(path: string, contextBuilder: (scene?: string) => (store: AsyncRowStore<ED, Cxt>, headers?: IncomingHttpHeaders) => Promise<Cxt>, dropIfExists?: boolean): Promise<void>;
