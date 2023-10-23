import { AspectDict } from "@project/aspects/AspectDict";
import { FeatureDict } from "@project/features";
import { EntityDict } from "@oak-app-domain";
import { BasicFeatures } from "oak-frontend-base";
import { GFD, GAD } from "oak-general-business";
import { BackendRuntimeContext } from "../context/BackendRuntimeContext";
import { FrontendRuntimeContext } from "../context/FrontendRuntimeContext";


type BRC = BackendRuntimeContext;
type FRC = FrontendRuntimeContext;
export type RuntimeCxt = FRC | BRC;

export type AAD = AspectDict & GAD<EntityDict, BackendRuntimeContext>;
export type AFD = FeatureDict & GFD<EntityDict, BackendRuntimeContext, FrontendRuntimeContext, AAD>;