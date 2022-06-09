"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tip_style_1 = require("./tip-style");
const cross_spawn_1 = __importDefault(require("cross-spawn"));
async function build(cmd) {
    if (!cmd.target) {
        (0, tip_style_1.Error)(`${(0, tip_style_1.error)(`Please add --target web or --target mp to he command`)}`);
        return;
    }
    (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`build ${cmd.target} environment: ${cmd.mode}`)}`);
    if (cmd.target === 'mp') {
        const result = cross_spawn_1.default.sync(`cross-env NODE_ENV=${cmd.mode} NODE_TARGET=${cmd.target} "${process.execPath}"`, [require.resolve('../scripts/build-mp.js')], {
            stdio: 'inherit',
            shell: true,
        });
        if (result.status === 0) {
            (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`执行完成`)}`);
        }
        else {
            (0, tip_style_1.Error)(`${(0, tip_style_1.error)(`执行失败`)}`);
        }
    }
    else if (cmd.target === 'web') {
        const result = cross_spawn_1.default.sync(`cross-env NODE_ENV=${cmd.mode} NODE_TARGET=${cmd.target} "${process.execPath}"`, [
            require.resolve(`../scripts/${cmd.mode === 'production'
                ? 'build-web.js'
                : 'start-web.js'}`),
        ], {
            stdio: 'inherit',
            shell: true,
        });
        if (result.status === 0) {
            (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`执行完成`)}`);
        }
        else {
            (0, tip_style_1.Error)(`${(0, tip_style_1.error)(`执行失败`)}`);
        }
    }
}
exports.default = build;
