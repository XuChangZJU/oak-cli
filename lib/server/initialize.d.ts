/// <reference path="../../src/typings/polyfill.d.ts" />
import { Context, EntityDict, RowStore } from 'oak-domain/lib/types';
export declare function initialize<ED extends EntityDict, Cxt extends Context<ED>>(path: string, contextBuilder: (scene?: string) => (store: RowStore<ED, Cxt>) => Cxt, dropIfExists?: boolean): Promise<void>;
