import { GenerateIdOption } from "oak-backend-base/src/polyfill";

declare global {
    const generateNewId: (option?: GenerateIdOption) => Promise<string>;
    const __DEV__: boolean;
}
export {}