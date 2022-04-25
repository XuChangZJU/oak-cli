"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tip_style_1 = require("./tip-style");
const cross_spawn_1 = __importDefault(require("cross-spawn"));
async function build(cmd) {
    (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`build ${cmd.target} environment: ${cmd.mode}`)}`);
    const result = cross_spawn_1.default.sync(`cross-env NODE_ENV=${cmd.mode} "${process.execPath}"`, [require.resolve('../scripts/' + 'webpack.js')], {
        stdio: 'inherit',
        shell: true,
    });
    // const result = spawn.sync('npm -v', [], { stdio: 'inherit', shell: true });
    if (result.status === 0) {
        (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`执行完成`)}`);
    }
    else {
        (0, tip_style_1.Error)(`${(0, tip_style_1.error)(`执行失败`)}`);
    }
}
exports.default = build;
