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
    const mode = (cmd.mode || 'development');
    const target = cmd.target;
    if (!cmd.target) {
        (0, tip_style_1.Error)(`${(0, tip_style_1.error)(`Please add --target web or --target mp(wechatMp) or --target rn(native) to run the project in Web/WechatMp/ReactNative environment`)}`);
        return;
    }
    let subdir = cmd.subDir;
    if (!subdir) {
        subdir = ['mp', 'wechatMp'].includes(target)
            ? 'wechatMp'
            : ['native', 'rn'].includes(target)
                ? 'native'
                : 'web';
    }
    // 先makeLocale
    (0, makeLocale_1.default)('', mode === 'development');
    // 再尝试makeRouter
    (0, makeRouter_1.default)({ subdir }, mode === 'development');
    //ts类型检查 waring 还是error,
    //主要web受影响，error级别的话 控制台和网页都报错，warning级别的话 控制台报错
    // development/staging/production
    const errorLevel = cmd.check !== 'error';
    (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`build ${target} environment:${mode} ${['development'].includes(mode) ? `server:${!!cmd.prod}` : ''} ${['mp', 'wechatMp'].includes(target) &&
        ['development'].includes(mode)
        ? `split:${!!cmd.split}`
        : ''}`)}`);
    if (['mp', 'wechatMp'].includes(target)) {
        const mpFileMap = {
            production: 'build-mp.js',
            staging: 'build-staging-mp.js',
            development: 'start-mp.js',
        };
        const result = cross_spawn_1.default.sync(`cross-env`, [
            `NODE_ENV=${mode}`,
            `NODE_TARGET=${target}`,
            `SUB_DIR_NAME=${subdir}`,
            `TSC_COMPILE_ON_ERROR=${errorLevel}`,
            `COMPILE_ANALYZE=${!!cmd.analyze}`,
            `GENERATE_SOURCEMAP=${!!cmd.sourcemap}`,
            `PROD=${!!cmd.prod}`,
            `SPLIT=${!!cmd.split}`,
            !!cmd.memoryLimit && `MEMORY_LIMIT=${cmd.memoryLimit}`,
            `node`,
            cmd.memoryLimit && `--max_old_space_size=${cmd.memoryLimit}`,
            (0, path_1.resolve)(__dirname, `../scripts/${mpFileMap[mode]}`),
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
    else if (target === 'web') {
        const webFileMap = {
            production: 'build-web.js',
            staging: 'build-staging-web.js',
            development: 'start-web.js',
        };
        const result = cross_spawn_1.default.sync(`cross-env`, [
            `NODE_ENV=${mode}`,
            `NODE_TARGET=${target}`,
            `SUB_DIR_NAME=${subdir}`,
            `TSC_COMPILE_ON_ERROR=${errorLevel}`,
            `COMPILE_ANALYZE=${!!cmd.analyze}`,
            `GENERATE_SOURCEMAP=${!!cmd.sourcemap}`,
            `PROD=${!!cmd.prod}`,
            !!cmd.memoryLimit && `MEMORY_LIMIT=${cmd.memoryLimit}`,
            `node`,
            cmd.memoryLimit && `--max_old_space_size=${cmd.memoryLimit}`,
            (0, path_1.resolve)(__dirname, `../scripts/${webFileMap[mode]}`),
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
    else if (['native', 'rn'].includes(target)) {
        const prjDir = process.cwd();
        const cwd = (0, path_1.resolve)(prjDir, subdir);
        (0, fs_1.copyFileSync)((0, path_1.resolve)(prjDir, 'package.json'), (0, path_1.resolve)(cwd, 'package.json'));
        // rn不支持注入NODE_ENVIRONMENT这样的环境变量，cross-env没有用
        const platform = cmd.platform;
        let result;
        if (mode === 'production') {
            //cd native/android && cross-env NODE_ENV=production ./gradlew assembleRelease
            result = cross_spawn_1.default.sync(`cd android`, [
                '&& cross-env',
                `NODE_ENV=${mode}`,
                'OAK_PLATFORM=native',
                './gradlew assembleRelease',
            ].filter(Boolean), {
                cwd,
                stdio: 'inherit',
                shell: true,
            });
        }
        else if (mode === 'staging') {
            //cd native/android && cross-env NODE_ENV=production ./gradlew assembleStaging
            result = cross_spawn_1.default.sync(`cd android`, [
                '&& cross-env',
                `NODE_ENV=${mode}`,
                'OAK_PLATFORM=native',
                './gradlew assembleStaging',
            ].filter(Boolean), {
                cwd,
                stdio: 'inherit',
                shell: true,
            });
        }
        else {
            result = cross_spawn_1.default.sync(`cross-env`, [
                `NODE_ENV=${mode}`,
                'OAK_PLATFORM=native',
                `PROD=${!!cmd.prod}`,
                'react-native',
                'start',
            ].filter(Boolean), {
                cwd,
                stdio: 'inherit',
                shell: true,
            });
        }
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
