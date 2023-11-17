
import initialize from '@project/initialize';
import { createComponent } from '@project/page';
import { host } from './configuration';
import { getAppType } from './utils/env';

const appType = getAppType();

const { features } = initialize(appType, host);

Object.assign(global, {
    features,
    OakComponent: (options: any) => createComponent(options, features),
});

export {
    features,
};
