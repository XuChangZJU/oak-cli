import { initialize } from 'oak-cli/lib/server/initialize';
import { RuntimeContext } from '../src/RuntimeContext';

const pwd = process.cwd();

const dropIfExists = process.argv[2];
console.log(dropIfExists);

initialize(pwd, RuntimeContext.FromCxtStr, !!dropIfExists)
    .then(
        () => process.exit(0)
    );