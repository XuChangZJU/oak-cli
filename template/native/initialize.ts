import initialize from '@project/initialize';
import { createComponent } from '@project/page';
import { host } from './configuration';
const { features } = initialize('native', host);

Object.assign(global, {
    features,
    OakComponent: (options: any) => createComponent(options, features),
});

export default features;
