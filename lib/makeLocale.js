"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const tip_style_1 = require("./tip-style");
const cross_spawn_1 = tslib_1.__importDefault(require("cross-spawn"));
const path_1 = require("path");
async function make(cmd, watch) {
    (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`make locales`)}`);
    // ts-node scripts/build-app-domain & npm link ./app-domain
    const args = [(0, path_1.resolve)(__dirname, '../scripts/make-locale.js')];
    if (watch) {
        args.push('true');
    }
    if (!watch) {
        const result = cross_spawn_1.default.sync('ts-node', args, {
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
    else {
        (0, cross_spawn_1.default)('ts-node', args, {
            stdio: 'inherit',
            shell: true,
        });
    }
}
exports.default = make;
