import { ExceptionRouters } from 'oak-frontend-base';
import { ExampleException } from './types/Exception';
import { exceptionRouters as generalExceptionRouter } from 'oak-general-business';

export const routers = [
    [
        ExampleException,
        {
            router: '/url/url',
        },
    ],
    ...generalExceptionRouter,
] as ExceptionRouters;
