/// <reference path="../../src/typings/polyfill.d.ts" />
import { Context, EntityDict, RowStore } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
export declare function initialize<ED extends EntityDict & BaseEntityDict, Cxt extends Context<ED>>(path: string, contextBuilder: (scene?: string) => (store: RowStore<ED, Cxt>) => Promise<Cxt>, dropIfExists?: boolean): Promise<void>;
