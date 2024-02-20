// import { CompilerConfiguration } from 'oak-domain/lib/types/Configuration';
const path = require('path');

module.exports = {
    webpack: {
        resolve: {
            alias: {
                '@project': path.resolve('src'),
                '@oak-app-domain': path.resolve('src', 'oak-app-domain'),
            }
        }
    }
};
