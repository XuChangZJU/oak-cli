import { EntityDict } from '@oak-app-domain';
import { Trigger } from 'oak-domain/lib/types';
import { BackendRuntimeContext } from '../context/BackendRuntimeContext';


const triggers = [

] as Trigger<EntityDict, keyof EntityDict, BackendRuntimeContext>[];

export default triggers;
