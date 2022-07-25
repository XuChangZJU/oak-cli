import { startup } from 'oak-cli/lib/server/start';
import { RuntimeContext } from '../src/RuntimeContext';
import { makeException } from '../src/types/Exception';
import { SimpleConnector } from 'oak-domain/lib/utils/SimpleConnector';
const pwd = process.cwd();

const connector = new SimpleConnector('', makeException, RuntimeContext.FromCxtStr);
startup(pwd, RuntimeContext.FromCxtStr, connector);