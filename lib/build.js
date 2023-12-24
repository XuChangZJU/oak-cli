"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const tip_style_1 = require("./tip-style");
const cross_spawn_1 = tslib_1.__importDefault(require("cross-spawn"));
const path_1 = require("path");
const makeLocale_1 = tslib_1.__importDefault(require("./makeLocale"));
const makeRouter_1 = tslib_1.__importDefault(require("./makeRouter"));
const fs_1 = require("fs");
async function build(cmd) {
    if (!cmd.target) {
        (0, tip_style_1.Error)(`${(0, tip_style_1.error)(`Please add --target web or --target mp(wechatMp) or --target rn(native) to run the project in Web/WechatMp/ReactNative environment`)}`);
        return;
    }
    let subdir = cmd.subDir;
    if (!subdir) {
        subdir = ['mp', 'wechatMp'].includes(cmd.target) ? 'wechatMp' : (['native', 'rn'].includes(cmd.target) ? 'native' : 'web');
    }
    // 先makeLocale
    (0, makeLocale_1.default)('', cmd.mode === 'development');
    // 再尝试makeRouter
    (0, makeRouter_1.default)({ subdir }, cmd.mode === 'development');
    //ts类型检查 waring 还是error,
    //主要web受影响，error级别的话 控制台和网页都报错，warning级别的话 控制台报错
    // development/staging/production
    const TSC_COMPILE_ON_ERROR = cmd.check !== 'error';
    (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`build ${cmd.target} environment:${cmd.mode} ${['development'].includes(cmd.mode) ? `server:${!!cmd.prod}` : ''} ${['mp', 'wechatMp'].includes(cmd.target) &&
        ['development'].includes(cmd.mode)
        ? `split:${!!cmd.split}`
        : ''}`)}`);
    if (['mp', 'wechatMp'].includes(cmd.target)) {
        const result = cross_spawn_1.default.sync(`cross-env`, [
            `NODE_ENV=${cmd.mode}`,
            `NODE_TARGET=${cmd.target}`,
            `SUB_DIR_NAME=${subdir}`,
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
            `SUB_DIR_NAME=${subdir}`,
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
    else if (['native', 'rn'].includes(cmd.target)) {
        const prjDir = process.cwd();
        const cwd = (0, path_1.resolve)(prjDir, subdir);
        (0, fs_1.copyFileSync)((0, path_1.resolve)(prjDir, 'package.json'), (0, path_1.resolve)(cwd, 'package.json'));
        // rn不支持注入NODE_ENVIRONMENT这样的环境变量，cross-env没有用
        /* const result = spawn.sync(
            'react-native',
            [
                'start',
            ],
            {
                cwd,
                stdio: 'inherit',
                shell: true,
            }
        ); */
        const result = cross_spawn_1.default.sync(`cross-env`, [
            `NODE_ENV=${cmd.mode}`,
            'OAK_PLATFORM=native',
            `PROD=${!!cmd.prod}`,
            'react-native',
            'start',
        ].filter(Boolean), {
            cwd,
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
    else {
        (0, tip_style_1.Error)(`${(0, tip_style_1.error)(`target could only be web or mp(wechatMp) or rn(native)`)}`);
    }
}
exports.default = build;
