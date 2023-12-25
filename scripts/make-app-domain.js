const { existsSync } = require('fs');
const { removeSync } = require('fs-extra');
const { join } = require('path');
const {
    buildSchema,
    analyzeEntities,
} = require(`${process.cwd()}/node_modules/oak-domain/lib/compiler/schemalBuilder`);

// todo，这里还是很奇怪，要把src/entites的依赖给去掉
analyzeEntities(`${process.cwd()}/node_modules/oak-domain/src/entities`, 'oak-domain/lib/entities');
// 从config中读出相应依赖
const externalLibFile = join(process.cwd(), 'src', 'config', 'oakExternalLib.json');
if (existsSync(externalLibFile)) {
    const exteralLibs = require(externalLibFile);
    exteralLibs.forEach(
        (ele) => {
            analyzeEntities(`${process.cwd()}/node_modules/${ele}/src/entities`, `${ele}/lib/entities`);
        }
    );
}
analyzeEntities(join(process.cwd(), 'src', 'entities'));
removeSync(join(process.cwd(), 'src', 'oak-app-domain'));
buildSchema(join(process.cwd(), 'src', 'oak-app-domain'));