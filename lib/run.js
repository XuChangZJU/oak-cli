"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const tip_style_1 = require("./tip-style");
const cross_spawn_1 = tslib_1.__importDefault(require("cross-spawn"));
const path_1 = require("path");
const fs_1 = require("fs");
async function run(options) {
    const prjDir = process.cwd();
    const cwd = (0, path_1.resolve)(process.cwd(), options.subDir || 'native');
    if (options.platform === 'ios') {
        (0, fs_1.copyFileSync)((0, path_1.resolve)(prjDir, 'package.json'), (0, path_1.resolve)(cwd, 'package.json'));
        (0, tip_style_1.Success)(`${(0, tip_style_1.primary)('run react-native run-ios')}`);
        const result = cross_spawn_1.default.sync('react-native', ['run-ios'], {
            cwd,
            stdio: 'inherit',
            shell: true,
        });
        if (result.status === 0) {
            (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`react-native run-ios success`)}`);
        }
        else {
            Error(`${(0, tip_style_1.error)('react-native run-ios fail')}`);
            process.exit(-1);
        }
    }
    else if (options.platform === 'android') {
        (0, tip_style_1.Success)(`${(0, tip_style_1.primary)('run react-native run-android')}`);
        (0, fs_1.copyFileSync)((0, path_1.resolve)(prjDir, 'package.json'), (0, path_1.resolve)(cwd, 'package.json'));
        const result = cross_spawn_1.default.sync('react-native', ['run-android'], {
            cwd,
            stdio: 'inherit',
            shell: true,
        });
        if (result.status === 0) {
            (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`react-native run-android success`)}`);
        }
        else {
            Error(`${(0, tip_style_1.error)('react-native run-android fail')}`);
            process.exit(-1);
        }
    }
    else {
        Error((0, tip_style_1.error)(`unrecoganized platfrom: ${options.platform}`));
        process.exit(-1);
    }
}
exports.default = run;
