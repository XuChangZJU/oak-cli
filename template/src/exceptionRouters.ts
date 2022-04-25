import { ExceptionRouters } from 'oak-frontend-base';
import { exceptionRouters as GenenralExceptionRouters } from 'oak-general-business';
import { ExampleException } from './types/Exception';

export const routers = ([
    [ExampleException, {
        router: '/url/url',
    }]
] as ExceptionRouters).concat(GenenralExceptionRouters);
