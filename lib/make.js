"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const tip_style_1 = require("./tip-style");
const cross_spawn_1 = tslib_1.__importDefault(require("cross-spawn"));
async function make() {
    (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`build oak-app-domain`)}`);
    // ts-node scripts/build-app-domain & npm link ./app-domain
    const result = cross_spawn_1.default.sync('ts-node', [require.resolve('../scripts/' + 'build-app-domain.js')], {
        stdio: 'inherit',
        shell: true,
    });
    // const result2 = spawn.sync('npm -v', [], { stdio: 'inherit', shell: true });
    if (result.status === 0) {
        (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`build 执行完成`)}`);
    }
    else {
        (0, tip_style_1.Error)(`${(0, tip_style_1.error)(`build 执行失败`)}`);
        process.exit(1);
    }
    /*  Success(`${success(`npm link oak-app-domain`)}`);
 
     const isWin = process.platform === 'win32';
     const result2 = !isWin ? spawn.sync(
         'sudo',
         [`npm link ${process.cwd()}/src/oak-app-domain`],
         {
             stdio: 'inherit',
             shell: true,
         }
     ) : spawn.sync(
         'npm',
         [`link ${process.cwd()}/src/oak-app-domain`],
         {
             stdio: 'inherit',
             shell: true,
         }
     );
 
     if (result2.status === 0) {
         Success(`${success(`link 执行完成`)}`);
     } else {
         Error(`${error(`link 执行失败`)}`);
         process.exit(1);
     } */
}
exports.default = make;
