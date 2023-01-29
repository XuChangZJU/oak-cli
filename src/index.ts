#!/usr/bin/env node
import program from 'commander';
import { create, update } from './create';
import build from './build';
import make from './make';
import run from './run';
import { CLI_VERSION, CLI_NAME } from './config';
import { error, warn } from './tip-style';

/**
 * @name 未知参数错误提示
 * @param {string} methodName
 * @param {Function} log
 */
function enhanceErrorMessages(methodName: string, log: Function) {
    program.Command.prototype[methodName] = function (...args: any) {
        if (methodName === 'unknownOption' && this._allowUnknownOption) {
            return;
        }
        this.outputHelp();
        console.log(`  ` + error(log(...args)));
        console.log();
        process.exit(1);
    };
}

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];
const minNodeVersion = 14;

if (Number(major) < minNodeVersion) {
    console.error(
        'You are running Node ' +
            currentNodeVersion +
            '.\n' +
            'Create React App requires Node ' +
            minNodeVersion +
            ' or higher. \n' +
            'Please update your version of Node.'
    );
    process.exit(1);
}

program.version(CLI_VERSION, '-v, --version').usage('<command> [options]');

program
    .command('make')
    .description('build oak app domain of make on demand')
    .action(make);
program
    .command('start')
    .option('--sourceMap', 'sourceMap')
    .option('--analyze', 'analyze')
    .option('--memoryLimit <memoryLimit>', 'memoryLimit of node')
    .option('-t, --target <target>', 'target')
    .option('-m, --mode <mode>', 'mode')
    .option('-d, --subDir <subDirName>', 'subDirName')
    .option('-c, --check <level>', 'level')
    .description('build project of start on demand')
    .action(build);
program
    .command('build')
    .option('--sourcemap', 'sourcemap')
    .option('--analyze', 'analyze')
    .option('--memoryLimit <memoryLimit>', 'memoryLimit of node')
    .option('-t, --target <target>', 'target')
    .option('-m, --mode <mode>', 'mode')
    .option('-d, --subDir <subDirName>', 'subDirName')
    .option('-c, --check <level>', 'level')
    .description('build project of build on demand')
    .action(build);
program
    .command('create <name>')
    .usage('<name>')
    .option('-d, --dev', 'dev')
    .description(`create a new project powered by ${CLI_NAME}`)
    .action(create);
program
    .command('update <name> [subDirName]')
    .usage('<name>')
    .option('-d, --dev', 'dev')
    .description(`update project's template powered by ${CLI_NAME}`)
    .action(update);
program
    .command('run')
    .option('-i, --initialize', 'true')
    .option('-m, --mode <mode>', 'mode')
    .description(`run backend server by ${CLI_NAME}`)
    .action(run);
// output help information on unknown commands
program.arguments('<command>').action((cmd) => {
    program.outputHelp();
    console.log();
    console.log(`  ` + `${error(`Unknown command ${warn(cmd)}`)}`);
    console.log();
});

enhanceErrorMessages('missingArgument', (argName: string) => {
    console.log();
    return `${error(`Missing required argument ${warn(argName)}.`)}`;
});
program.parse(process.argv);
