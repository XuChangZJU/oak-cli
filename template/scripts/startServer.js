const { startup } = require('oak-cli/src/server/start');
const { BackendRuntimeContext } = require('../src/context/BackendRuntimeContext');
const { makeException } = require('../src/types/Exception');
const { SimpleConnector } = require('oak-domain/lib/utils/SimpleConnector');
const pwd = process.cwd();

const connector = new SimpleConnector('', makeException, BackendRuntimeContext.FromSerializedString);
startup(pwd, BackendRuntimeContext.FromSerializedString, connector);