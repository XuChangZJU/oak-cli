/// <reference path="../../src/typings/polyfill.d.ts" />
import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext, AsyncRowStore } from 'oak-domain/lib/store/AsyncRowStore';
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>>(path: string, contextBuilder: (scene?: string) => (store: AsyncRowStore<ED, Cxt>) => Promise<Cxt>, dropIfExists?: boolean): Promise<void>;
