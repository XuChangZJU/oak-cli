"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const tip_style_1 = require("./tip-style");
const cross_spawn_1 = tslib_1.__importDefault(require("cross-spawn"));
const makeLocale_1 = tslib_1.__importDefault(require("./makeLocale"));
async function build(cmd) {
    if (!cmd.target) {
        (0, tip_style_1.Error)(`${(0, tip_style_1.error)(`Please add --target web or --target mp or --target wechatMp to he command`)}`);
        return;
    }
    // 先makeLocale
    (0, makeLocale_1.default)();
    //ts类型检查 waring 还是error,
    //主要web受影响，error级别的话 控制台和网页都报错，warning级别的话 控制台报错
    const TSC_COMPILE_ON_ERROR = cmd.check !== 'error';
    (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`build ${cmd.target} environment:${cmd.mode} ${cmd.mode !== 'production'
        ? `server:${!!cmd.prod}`
        : ''} ${cmd.target !== 'web' && cmd.mode !== 'production'
        ? `split:${!!cmd.split}`
        : ''}`)}`);
    if (cmd.target === 'mp' || cmd.target === 'wechatMp') {
        const result = cross_spawn_1.default.sync(`cross-env`, [
            `NODE_ENV=${cmd.mode}`,
            `NODE_TARGET=${cmd.target}`,
            `SUB_DIR_NAME=${cmd.subDir || 'wechatMp'}`,
            `TSC_COMPILE_ON_ERROR=${TSC_COMPILE_ON_ERROR}`,
            `COMPILE_ANALYZE=${!!cmd.analyze}`,
            `GENERATE_SOURCEMAP=${!!cmd.sourcemap}`,
            `PROD=${!!cmd.prod}`,
            `SPLIT=${!!cmd.split}`,
            !!cmd.memoryLimit && `MEMORY_LIMIT=${cmd.memoryLimit}`,
            `node`,
            cmd.memoryLimit && `--max_old_space_size=${cmd.memoryLimit}`,
            require.resolve(`../scripts/${cmd.mode === 'production'
                ? 'build-mp.js'
                : 'start-mp.js'}`),
        ].filter(Boolean), {
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
        const result = cross_spawn_1.default.sync(`cross-env`, [
            `NODE_ENV=${cmd.mode}`,
            `NODE_TARGET=${cmd.target}`,
            `SUB_DIR_NAME=${cmd.subDir || 'web'}`,
            `TSC_COMPILE_ON_ERROR=${TSC_COMPILE_ON_ERROR}`,
            `COMPILE_ANALYZE=${!!cmd.analyze}`,
            `GENERATE_SOURCEMAP=${!!cmd.sourcemap}`,
            `PROD=${!!cmd.prod}`,
            !!cmd.memoryLimit && `MEMORY_LIMIT=${cmd.memoryLimit}`,
            `node`,
            cmd.memoryLimit && `--max_old_space_size=${cmd.memoryLimit}`,
            require.resolve(`../scripts/${cmd.mode === 'production'
                ? 'build-web.js'
                : 'start-web.js'}`),
        ].filter(Boolean), {
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
