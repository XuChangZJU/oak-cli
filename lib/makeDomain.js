"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const tip_style_1 = require("./tip-style");
const cross_spawn_1 = tslib_1.__importDefault(require("cross-spawn"));
const path_1 = require("path");
async function make() {
    (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`make oak-app-domain`)}`);
    // ts-node scripts/build-app-domain & npm link ./app-domain
    const result = cross_spawn_1.default.sync('ts-node', [(0, path_1.resolve)(__dirname, '../scripts/' + 'make-app-domain.js')], {
        stdio: 'inherit',
        shell: true,
    });
    // const result2 = spawn.sync('npm -v', [], { stdio: 'inherit', shell: true });
    if (result.status === 0) {
        (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`make 执行完成`)}`);
    }
    else {
        (0, tip_style_1.Error)(`${(0, tip_style_1.error)(`make 执行失败`)}`);
        process.exit(-1);
    }
}
exports.default = make;
