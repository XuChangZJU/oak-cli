
const {
    buildSchema,
    analyzeEntities,
} = require(`${process.cwd()}/node_modules/oak-domain/src/compiler/schemalBuilder`);

analyzeEntities(`${process.cwd()}/node_modules/oak-general-business/src/entities`);
analyzeEntities(`${process.cwd()}/src/entities`);
buildSchema(`${process.cwd()}/src/oak-app-domain`);