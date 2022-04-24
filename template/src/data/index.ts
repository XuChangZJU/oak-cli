import { applications } from './application';
import { systems } from './system';
import { data as GeneralData } from 'oak-general-business';

export const data = Object.assign({
    application: applications,
    system: systems,
}, GeneralData);
