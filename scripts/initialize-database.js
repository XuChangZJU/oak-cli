const { initialize } = require('oak-backend-base');
const pwd = process.cwd();

const dropIfExists = process.argv[2];

initialize(pwd, dropIfExists)
.then(
    () => process.exit(0)
);