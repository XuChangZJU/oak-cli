const { existsSync } = require('fs');
const {
    buildSchema,
    analyzeEntities,
    registerIgnoredRelationPathSet,
} = require(`${process.cwd()}/node_modules/oak-domain/lib/compiler/schemalBuilder`);
if (existsSync(`${process.cwd()}/src/config/ignoredRelationPathSet.ts`)) {
    const set = require(`${process.cwd()}/src/config/ignoredRelationPathSet.ts`).default;
    registerIgnoredRelationPathSet(set);
}

analyzeEntities(`${process.cwd()}/node_modules/oak-domain/src/entities`, 'oak-domain/lib/entities');
analyzeEntities(`${process.cwd()}/node_modules/oak-general-business/src/entities`, 'oak-general-business/lib/entities');
analyzeEntities(`${process.cwd()}/src/entities`);
buildSchema(`${process.cwd()}/src/oak-app-domain`);