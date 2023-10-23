import { OakException } from 'oak-domain/lib/types';
import { EntityDict } from '@oak-app-domain';
import { makeException as makeGeneralException } from 'oak-general-business';

export class ExampleException extends OakException<EntityDict> {}

export function makeException(msg: string | object) {
    const data = typeof msg === 'string' ? JSON.parse(msg) : msg;

    const exception = makeGeneralException(data);
    if (exception) {
        return exception;
    }

    const { name, message } = data;
    switch (name) {
        case 'ExampleException': {
            return new ExampleException(message);
        }
        default: {
            throw new OakException(`不可解读的exception信息「${msg}」`);
        }
    }
}
