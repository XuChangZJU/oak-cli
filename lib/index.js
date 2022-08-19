#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = tslib_1.__importDefault(require("commander"));
const create_1 = require("./create");
const build_1 = tslib_1.__importDefault(require("./build"));
const make_1 = tslib_1.__importDefault(require("./make"));
const run_1 = tslib_1.__importDefault(require("./run"));
const config_1 = require("./config");
const tip_style_1 = require("./tip-style");
/**
 * @name 未知参数错误提示
 * @param {string} methodName
 * @param {Function} log
 */
function enhanceErrorMessages(methodName, log) {
    commander_1.default.Command.prototype[methodName] = function (...args) {
        if (methodName === 'unknownOption' && this._allowUnknownOption) {
            return;
        }
        this.outputHelp();
        console.log(`  ` + (0, tip_style_1.error)(log(...args)));
        console.log();
        process.exit(1);
    };
}
const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];
const minNodeVersion = 14;
if (Number(major) < minNodeVersion) {
    console.error('You are running Node ' +
        currentNodeVersion +
        '.\n' +
        'Create React App requires Node ' +
        minNodeVersion +
        ' or higher. \n' +
        'Please update your version of Node.');
    process.exit(1);
}
commander_1.default.version(config_1.CLI_VERSION, '-v, --version').usage('<command> [options]');
commander_1.default
    .command('make')
    .description('build oak app domain of make on demand')
    .action(make_1.default);
commander_1.default
    .command('start')
    .option('--analyze', 'analyze')
    .option('-t, --target <target>', 'target')
    .option('-m, --mode <mode>', 'mode')
    .option('-d, --subDir <subDirName>', 'subDirName')
    .option('-c, --check <level>', 'level')
    .description('build project of start on demand')
    .action(build_1.default);
commander_1.default
    .command('build')
    .option('--analyze', 'analyze')
    .option('-t, --target <target>', 'target')
    .option('-m, --mode <mode>', 'mode')
    .option('-d, --subDir <subDirName>', 'subDirName')
    .option('-c, --check <level>', 'level')
    .description('build project of build on demand')
    .action(build_1.default);
commander_1.default
    .command('create <name>')
    .usage('<name>')
    .option('-d, --dev', 'dev')
    .description(`create a new project powered by ${config_1.CLI_NAME}`)
    .action(create_1.create);
commander_1.default
    .command('update <name> [subDirName]')
    .usage('<name>')
    .option('-d, --dev', 'dev')
    .description(`update project's template powered by ${config_1.CLI_NAME}`)
    .action(create_1.update);
commander_1.default
    .command('run')
    .option('-i, --initialize', 'true')
    .option('-m, --mode <mode>', 'mode')
    .description(`run backend server by ${config_1.CLI_NAME}`)
    .action(run_1.default);
// output help information on unknown commands
commander_1.default.arguments('<command>').action((cmd) => {
    commander_1.default.outputHelp();
    console.log();
    console.log(`  ` + `${(0, tip_style_1.error)(`Unknown command ${(0, tip_style_1.warn)(cmd)}`)}`);
    console.log();
});
enhanceErrorMessages('missingArgument', (argName) => {
    console.log();
    return `${(0, tip_style_1.error)(`Missing required argument ${(0, tip_style_1.warn)(argName)}.`)}`;
});
commander_1.default.parse(process.argv);
