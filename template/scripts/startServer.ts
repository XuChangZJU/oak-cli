import { startup } from 'oak-cli/lib/server/start';
import { BackendRuntimeContext } from '../src/context/BackendRuntimeContext';
import { makeException } from '../src/types/Exception';
import { SimpleConnector } from 'oak-domain/lib/utils/SimpleConnector';
const pwd = process.cwd();

const connector = new SimpleConnector('', makeException, BackendRuntimeContext.FromSerializedString);
startup(pwd, BackendRuntimeContext.FromSerializedString, connector);