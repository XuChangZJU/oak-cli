import { EntityDict } from 'oak-app-domain';
import { FrontendRuntimeContext as GeneralFrontendRuntimeContext} from 'oak-general-business/lib/context/FrontendRuntimeContext';
import { CommonAspectDict } from 'oak-common-aspect';
import { RuntimeContext } from './RuntimeContext';
import { AspectDict } from '../aspects/AspectDict';

type FullAspectDict = CommonAspectDict<EntityDict, RuntimeContext> & AspectDict;

export class FrontendRuntimeContext extends GeneralFrontendRuntimeContext<EntityDict, RuntimeContext, FullAspectDict> implements RuntimeContext {

}