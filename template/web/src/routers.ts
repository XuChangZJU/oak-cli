import { IRouter } from './types/router';

export type Folder = 'test';
export type Routers = Record<Folder, IRouter[]>;

import testAllRouters from './app/test/router';

export const routers: Routers = {
    test: testAllRouters,
};

export default routers;
