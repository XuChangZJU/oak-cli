import { GenerateIdOption } from '../utils/polyfill';
import {
    MakeOakComponent,
    MakeOakPage,
} from 'oak-frontend-base/lib/types/Page';
import { EntityDict } from 'oak-app-domain';
import { RuntimeContext } from '../context/RuntimeContext';
import { aspectDict } from '../aspects';
import { initialize } from '../initialize';

declare global {
    const __DEV__: boolean;
    const generateNewId: (option?: GenerateIdOption) => Promise<string>;
    const getRandomValues: (length: number) => Promise<Uint8Array>;
    const OakPage: MakeOakPage<
        EntityDict,
        RuntimeContext,
        typeof aspectDict,
        ReturnType<typeof initialize>['features']
    >;
    const OakComponent: MakeOakComponent<
        EntityDict,
        RuntimeContext,
        typeof aspectDict,
        ReturnType<typeof initialize>['features']
    >;
}
export {};
