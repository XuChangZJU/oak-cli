const watch = process.argv[2];
const LocaleBuilder = require('oak-domain/lib/compiler/localeBuilder').default;
const builder = new LocaleBuilder(false);

builder.build(!!watch);