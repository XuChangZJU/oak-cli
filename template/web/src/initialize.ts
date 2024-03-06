
import { getAppType } from './utils/env';
import initialize from '@project/initialize';
import { createComponent } from '@project/page';
// import { port } from '../../configuration/server.json';
const configuration = require('../../configuration/server.json');

const appType = getAppType();

const { features } = initialize(
    appType,
    window.location.hostname,
    // 以下三行打开为dev模式
    undefined,
    '',
    configuration.port,
);

Object.assign(global, {
    features,
    OakComponent: (options: any) => createComponent(options, features),
});

export {
    features,
};
