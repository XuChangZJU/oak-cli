const { startup } = require('@xuchangzju/oak-cli/lib/server/start');
const {
    BackendRuntimeContext,
} = require('../lib/context/BackendRuntimeContext');
const { makeException } = require('../lib/types/Exception');
const { SimpleConnector } = require('oak-domain/lib/utils/SimpleConnector');
const pwd = process.cwd();

const connector = new SimpleConnector(
    '',
    makeException,
    BackendRuntimeContext.FromSerializedString
);
startup(pwd, BackendRuntimeContext.FromSerializedString, connector);
