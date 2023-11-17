import { Importation, Exportation } from "oak-domain/lib/types/Port";
import { EntityDict } from "@oak-app-domain";
import { BackendRuntimeContext } from '../context/BackendRuntimeContext';


export const importations: Importation<
    EntityDict,
    keyof EntityDict,
    any,
    BackendRuntimeContext
>[] = [];

export const exportations = [

] as Exportation<EntityDict, keyof EntityDict, any, BackendRuntimeContext>[];
