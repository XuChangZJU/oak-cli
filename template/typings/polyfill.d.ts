import { GenerateIdOption } from '@project/utils/polyfill';
import {
    MakeOakComponent,
} from 'oak-general-business';
import { EntityDict } from '@oak-app-domain';
import { AspectDict } from '@project/aspects/AspectDict';
import { FeatureDict } from '@project/features';
import { BackendRuntimeContext } from '@project/context/BackendRuntimeContext';
import { FrontendRuntimeContext } from '@project/context/FrontendRuntimeContext';

declare global {
    const OakComponent: MakeOakComponent<
        EntityDict,
        BackendRuntimeContext,
        FrontendRuntimeContext,
        AspectDict,
        FeatureDict
    >;
    const Aliplayer: any;
    const features: FeatureDict;
}
export {};
