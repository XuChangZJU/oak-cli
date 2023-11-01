import { EntityDict } from '@oak-app-domain';
import { Checker } from 'oak-domain/lib/types';
import { RuntimeCxt } from '../types/RuntimeCxt';

const checkers = [

] as Checker<EntityDict, keyof EntityDict, RuntimeCxt>[];

export default checkers;
