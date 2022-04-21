"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.warn = exports.primary = exports.error = exports.success = exports.Warn = exports.Start = exports.Error = exports.Success = void 0;
const chalk_1 = __importDefault(require("chalk"));
const consola_1 = __importDefault(require("consola"));
// tip type
const Success = (content) => consola_1.default.success(content);
exports.Success = Success;
const Error = (content) => consola_1.default.error(content);
exports.Error = Error;
const Start = (content) => consola_1.default.start(content);
exports.Start = Start;
const Warn = (content) => consola_1.default.warn(content);
exports.Warn = Warn;
// tip style
const success = (content) => chalk_1.default.greenBright(content);
exports.success = success;
const error = (content) => chalk_1.default.redBright(content);
exports.error = error;
const primary = (content) => chalk_1.default.blueBright(content);
exports.primary = primary;
const warn = (content) => chalk_1.default.yellowBright(content);
exports.warn = warn;
