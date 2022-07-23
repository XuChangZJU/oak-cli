import { applications } from './application';
import { systems } from './system';
import { domains } from './domain';
import { data as generalData } from 'oak-general-business';

export const data = {
    application: applications,
    system: systems,
    ...generalData,
    domain: domains,
};
