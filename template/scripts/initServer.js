const { initialize } = require('@xuchangzju/oak-cli/lib/server/initialize');
const {
    BackendRuntimeContext,
} = require('../lib/context/BackendRuntimeContext');

const pwd = process.cwd();

const dropIfExists = process.argv[2];
// console.log(dropIfExists);

initialize(
    pwd,
    BackendRuntimeContext.FromSerializedString,
    !!dropIfExists
).then(() => process.exit(0));
