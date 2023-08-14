const { existsSync } = require('fs');
const {
    buildSchema,
    analyzeEntities,
    registerIgnoredForeignKeyMap,
    registerIgnoredRelationPathMap,
    registerDeducedRelationMap,
    registerSelectFreeEntities,
} = require(`${process.cwd()}/node_modules/oak-domain/lib/compiler/schemalBuilder`);

analyzeEntities(`${process.cwd()}/node_modules/oak-domain/src/entities`, 'oak-domain/lib/entities');
analyzeEntities(`${process.cwd()}/node_modules/oak-general-business/src/entities`, 'oak-general-business/lib/entities');
analyzeEntities(`${process.cwd()}/src/entities`);
if (existsSync(`${process.cwd()}/src/config/relation.ts`)) {
    const { IgnoredForeignKeyMap, IgnoredRelationPathMap, DeducedRelationMap, SelectFreeEntities } = require(`${process.cwd()}/src/config/relation.ts`);
    if (IgnoredForeignKeyMap) {
        registerIgnoredForeignKeyMap(IgnoredForeignKeyMap);
    }
    if (IgnoredRelationPathMap) {
        registerIgnoredRelationPathMap(IgnoredRelationPathMap);
    }
    if (DeducedRelationMap) {
        registerDeducedRelationMap(DeducedRelationMap);
    }
    if (SelectFreeEntities) {
        registerSelectFreeEntities(SelectFreeEntities);
    }
}
buildSchema(`${process.cwd()}/src/oak-app-domain`);