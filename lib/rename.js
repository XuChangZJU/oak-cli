"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rename = exports.renameProject = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const editTemplate_1 = require("@react-native-community/cli/build/commands/init/editTemplate");
const tip_style_1 = require("./tip-style");
async function renameProject(dir, name, title, placeholderName, placeholderTitle) {
    // replace package.json中的name
    const packageJsonFilePath = (0, path_1.join)(dir, 'package.json');
    const packageJsonJson = require(packageJsonFilePath);
    packageJsonJson.name = name;
    const newPackageJsonContent = JSON.stringify(packageJsonJson, undefined, 4);
    (0, fs_1.writeFileSync)(packageJsonFilePath, newPackageJsonContent);
    // replace web下html的title
    // todo，这个替换方法不是很优雅，以后再改
    const htmlFilePath = (0, path_1.join)(dir, 'web', 'public', 'index.html');
    const htmlContent = (0, fs_1.readFileSync)(htmlFilePath, 'utf-8');
    const newHtmlContent = htmlContent.replace(new RegExp(placeholderTitle, 'g'), title).replace(new RegExp(placeholderTitle.toLowerCase(), 'g'), title.toLowerCase());
    (0, fs_1.writeFileSync)(htmlFilePath, newHtmlContent, 'utf-8');
    // replace wechatMp下project.config.json中的projectname
    // todo，现在这个是在wechatMp/src目录下的，可能是搞错了，待修正
    const pcjFilePath = (0, path_1.join)(dir, 'wechatMp', 'src', 'project.config.json');
    const pcjJson = require(pcjFilePath);
    pcjJson.projectname = title;
    const newPcjContent = JSON.stringify(pcjJson, undefined, 4);
    (0, fs_1.writeFileSync)(pcjFilePath, newPcjContent);
    // replace native下的相关数据
    const cwd = process.cwd();
    process.chdir((0, path_1.join)(dir, 'native'));
    await (0, editTemplate_1.changePlaceholderInTemplate)({
        projectName: name,
        projectTitle: title,
        placeholderName,
        placeholderTitle,
    });
    process.chdir(cwd);
    (0, tip_style_1.Success)(`${(0, tip_style_1.success)(`Change project name to ${(0, tip_style_1.primary)(name)}, project title to ${(0, tip_style_1.primary)(title)}`)}`);
}
exports.renameProject = renameProject;
async function rename(cmd) {
    const { projectName, displayName } = cmd;
    // todo 取native/android下的name和title作为placeholder，再调用renameProject
}
exports.rename = rename;
/* changePlaceholderInTemplate({
    projectName: 'taicang',
    projectTitle: '太藏',
    placeholderName: 'oak-template',
    placeholderTitle: 'oak template project',
}).then(
    () => console.log('success')
); */ 
