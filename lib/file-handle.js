"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFileExistsAndCreate = exports.checkFileExists = exports.copyFolder = exports.readFile = exports.writeFile = exports.deleteFolderRecursive = exports.parseJsonFile = exports.parseJsonFiles = exports.readDirGetFile = exports.readDirPath = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const enum_1 = require("./enum");
const tip_style_1 = require("./tip-style");
const pathList = new Set();
/**
 * @name 读取目录下所有文件
 * @export
 * @param {string} entry 目录名称
 */
function readDirPath(entry) {
    const dirInfo = (0, fs_1.readdirSync)(entry);
    for (let item of dirInfo) {
        const location = (0, path_1.join)(entry, item);
        const info = (0, fs_1.statSync)(location);
        if (info.isDirectory()) {
            readDirPath(location);
        }
        else {
            pathList.add(location);
        }
    }
    return pathList;
}
exports.readDirPath = readDirPath;
/**
 * @name 读取指定目录的文件（不进行深度遍历，只获取根目录）
 * @export
 * @param {*} entry
 * @returns
 */
function readDirGetFile(entry) {
    const dirInfo = (0, fs_1.readdirSync)(entry);
    return dirInfo;
}
exports.readDirGetFile = readDirGetFile;
/**
 * @name 解析json文件(数组)
 * @export
 * @param {Array<string>} arr
 * @returns
 */
function parseJsonFiles(arr) {
    const result = [];
    for (let item of arr) {
        const data = parseJsonFile(item);
        result.push(data);
    }
    return result;
}
exports.parseJsonFiles = parseJsonFiles;
/**
 * @name 解析单个文件json
 * @export
 * @param {PathLike} file
 * @returns
 */
function parseJsonFile(file) {
    try {
        const data = (0, fs_1.readFileSync)(file, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        return;
    }
}
exports.parseJsonFile = parseJsonFile;
/**
 * @name 删除文件夹
 * @export
 * @param {string} entry
 */
function deleteFolderRecursive(entry) {
    let files = [];
    // 判断给定的路径是否存在
    if ((0, fs_1.existsSync)(entry)) {
        // 返回文件和子目录的数组
        files = (0, fs_1.readdirSync)(entry);
        for (let file of files) {
            const curPath = (0, path_1.join)(entry, file);
            // fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
            if ((0, fs_1.statSync)(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
                // 是文件delete file  
            }
            else {
                (0, fs_1.unlinkSync)(curPath);
            }
        }
        // 清除文件夹
        (0, fs_1.rmdirSync)(entry);
    }
    else {
        // console.log("文件夹不存在");
    }
}
exports.deleteFolderRecursive = deleteFolderRecursive;
;
function writeFile(path, data) {
    try {
        (0, fs_1.writeFileSync)(path, data);
    }
    catch (err) {
        (0, tip_style_1.Error)((0, tip_style_1.error)(err));
        (0, tip_style_1.Error)((0, tip_style_1.error)('文件写入失败'));
    }
}
exports.writeFile = writeFile;
function readFile(path, options) {
    try {
        const data = (0, fs_1.readFileSync)(path, options);
        return data;
    }
    catch (err) {
        (0, tip_style_1.Error)((0, tip_style_1.error)(err));
        (0, tip_style_1.Error)((0, tip_style_1.error)('文件读取失败'));
    }
}
exports.readFile = readFile;
/**
 * @name 拷贝文件夹
 * @export
 * @param {PathLike} currentDir
 * @param {PathLike} targetDir
 */
function copyFolder(currentDir, targetDir, overwrite) {
    function handleFolder(currentDir, targetDir) {
        const files = (0, fs_1.readdirSync)(currentDir, {
            withFileTypes: true
        });
        for (let file of files) {
            // 拼接文件绝对路径
            const copyCurrentFileInfo = currentDir + '/' + file.name;
            const copyTargetFileInfo = targetDir + '/' + file.name;
            // 判断文件是否存在
            const readCurrentFile = (0, fs_1.existsSync)(copyCurrentFileInfo);
            const readTargetFile = (0, fs_1.existsSync)(copyTargetFileInfo);
            if (!readCurrentFile) {
                throw new global.Error(`操作失败，待拷贝的源路径${copyCurrentFileInfo}不存在`);
            }
            else if (file.isFile() && readTargetFile && !overwrite) {
                throw new global.Error(`操作失败，待拷贝的目标文件${copyTargetFileInfo}已经存在`);
            }
            else {
                // 判断是否为文件，如果为文件则复制，文件夹则递归
                if (file.isFile()) {
                    const readStream = (0, fs_1.createReadStream)(copyCurrentFileInfo);
                    const writeStream = (0, fs_1.createWriteStream)(copyTargetFileInfo);
                    readStream.pipe(writeStream);
                }
                else {
                    try {
                        (0, fs_1.accessSync)((0, path_1.join)(copyTargetFileInfo, '..'), fs_1.constants.W_OK);
                        copyFolder(copyCurrentFileInfo, copyTargetFileInfo, overwrite);
                    }
                    catch (error) {
                        (0, tip_style_1.Warn)('权限不足' + error);
                        throw error;
                    }
                }
            }
        }
    }
    if ((0, fs_1.existsSync)(currentDir)) {
        if (!(0, fs_1.existsSync)(targetDir)) {
            (0, fs_1.mkdirSync)(targetDir);
        }
        handleFolder(currentDir, targetDir);
    }
    else {
        throw new global.Error('需要copy的文件夹不存在:' + currentDir);
    }
}
exports.copyFolder = copyFolder;
/**
 * @name 检测文件/文件夹是否存在
 * @export
 * @param {(PathLike | string)} path
 * @returns
 */
function checkFileExists(path) {
    return (0, fs_1.existsSync)(path);
}
exports.checkFileExists = checkFileExists;
/**
 * @name 检测文件/文件夹是否存在，不存在则创建
 * @export
 * @param {(PathLike | string)} path
 * @param {*} [data]
 * @param {checkFileExistsAndCreateType} [type=checkFileExistsAndCreateType.DIRECTORY]
 */
function checkFileExistsAndCreate(path, data, type = enum_1.checkFileExistsAndCreateType.DIRECTORY, overwrite) {
    if (!checkFileExists(path) || overwrite) {
        switch (type) {
            case enum_1.checkFileExistsAndCreateType.DIRECTORY:
                (0, fs_1.mkdirSync)(path);
                break;
            case enum_1.checkFileExistsAndCreateType.FILE:
                writeFile(path, data);
                break;
            default:
                (0, fs_1.mkdirSync)(path);
                break;
        }
    }
    else {
        throw new global.Error(`${path} already exists!`);
    }
}
exports.checkFileExistsAndCreate = checkFileExistsAndCreate;
