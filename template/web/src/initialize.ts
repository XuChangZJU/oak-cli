
import { getAppType } from './utils/env';
import initialize from '@project/initialize';
import { createComponent } from '@project/page';

const appType = getAppType();

const { features } = initialize(
    appType,
    window.location.hostname
);

Object.assign(global, {
    features,
    OakComponent: (options: any) => createComponent(options, features),
});

export {
    features,
};
