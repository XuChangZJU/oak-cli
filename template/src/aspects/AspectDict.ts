import { RuntimeContext } from "../RuntimeContext";
import { AspectDict as GeneralAspectDict } from 'oak-general-business/src/aspects/AspectDict';
import { EntityDict } from "oak-app-domain";

export type AspectDict = {
    test: (params: string, context: RuntimeContext) => Promise<any>;
} & GeneralAspectDict<EntityDict, RuntimeContext>;
