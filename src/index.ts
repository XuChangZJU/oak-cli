#!/usr/bin/env node
import program from 'commander';
import create from './create';
import build from './build';
import make from './make';
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
    .command('start <env>')
    .usage('<env>')
    .description('build we chat mp of start on demand')
    .action(build);
program
    .command('build <env>')
    .usage('<env>')
    .description('build we chat mp of build on demand')
    .action(build);
program
    .command('create <name> [env]')
    .usage('<name>')
    // .option('-e, --env <env>', 'A env')
    .description(`create a new project powered by ${CLI_NAME}`)
    .action(create);
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
