#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const create_1 = __importDefault(require("./create"));
const build_1 = __importDefault(require("./build"));
const make_1 = __importDefault(require("./make"));
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
    .command('start <env>')
    .usage('<env>')
    .description('build we chat mp of start on demand')
    .action(build_1.default);
commander_1.default
    .command('build <env>')
    .usage('<env>')
    .description('build we chat mp of build on demand')
    .action(build_1.default);
commander_1.default
    .command('create <name> [env]')
    .usage('<name>')
    // .option('-e, --env <env>', 'A env')
    .description(`create a new project powered by ${config_1.CLI_NAME}`)
    .action(create_1.default);
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
