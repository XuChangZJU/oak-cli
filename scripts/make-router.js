const subdir = process.argv[2];
const watch = process.argv[3];
const { buildRouter } = require('oak-domain/lib/compiler/routerBuilder');
buildRouter(process.cwd(), subdir, !!watch);