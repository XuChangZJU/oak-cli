import { initialize } from 'oak-cli/lib/server/initialize';
import { BackendRuntimeContext } from '../src/context/BackendRuntimeContext';
import mysqlConfig from '../configuration/mysql.json';

const pwd = process.cwd();

const dropIfExists = process.argv[2];
console.log(dropIfExists);

initialize(pwd, BackendRuntimeContext.FromSerializedString, mysqlConfig as any, !!dropIfExists)
    .then(
        () => process.exit(0)
    );