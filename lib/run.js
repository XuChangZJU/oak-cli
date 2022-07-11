"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tip_style_1 = require("./tip-style");
const cross_spawn_1 = __importDefault(require("cross-spawn"));
async function run(options) {
    if (options.initialize) {
        (0, tip_style_1.Success)(`${(0, tip_style_1.success)('初始化数据库中……')}`);
        // ts-node scripts/build-app-domain & npm link ./app-domain
        const drop = options.args.includes('drop') || false;
        const result = cross_spawn_1.default.sync('ts-node', [require.resolve('../scripts/' + 'initialize-database.js'), `${drop}`], {
            stdio: 'inherit',
            shell: true,
        });
        if (result.status === 0) {
            (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`初始化数据库完成`)}`);
        }
        else {
            Error(`${(0, tip_style_1.error)(`初始化数据库失败`)}`);
            process.exit(1);
        }
    }
    else {
        (0, tip_style_1.Success)(`${(0, tip_style_1.success)('启动服务器……')}`);
        console.log(options.mode);
        // ts-node scripts/build-app-domain & npm link ./app-domain
        const result = cross_spawn_1.default.sync(`cross-env`, [
            `NODE_ENV=${options.mode}`,
            'ts-node',
            require.resolve('../scripts/' + 'start-server.js'),
        ], {
            stdio: 'inherit',
            shell: true,
        });
    }
}
exports.default = run;
