import { application, system, domain } from '../config/data';
import { relations } from '@project/oak-app-domain/Relation';
import actionAuth  from './actionAuth';
import relationAuth from './relationAuth';
import path from './path';
import i18n from './i18n';

const data = {
    application,
    system,
    domain,
    relation: relations,
    actionAuth,
    relationAuth,
    path,
    i18n,
};

export default data;
