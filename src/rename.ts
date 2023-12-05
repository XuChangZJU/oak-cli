import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { changePlaceholderInTemplate } from '@react-native-community/cli/build/commands/init/editTemplate';
import {
    Success,
    Error,
    error,
    primary,
    success,
    warn,
    Warn,
} from './tip-style';

export async function renameProject(dir: string, name: string, title: string, placeholderName: string, placeholderTitle: string) {
    // replace package.json中的name
    const packageJsonFilePath = join(dir, 'package.json');
    const packageJsonJson = require(packageJsonFilePath);
    packageJsonJson.name = name;
    const newPackageJsonContent = JSON.stringify(packageJsonJson, undefined, 4);
    writeFileSync(packageJsonFilePath, newPackageJsonContent);

    // replace web下html的title
    // todo，这个替换方法不是很优雅，以后再改
    const htmlFilePath = join(dir, 'web', 'public', 'index.html');
    const htmlContent = readFileSync(htmlFilePath, 'utf-8');
    const newHtmlContent = htmlContent.replace(new RegExp(placeholderTitle, 'g'), title).replace(new RegExp(placeholderTitle.toLowerCase(), 'g'), title.toLowerCase());
    writeFileSync(htmlFilePath, newHtmlContent, 'utf-8');

    // replace wechatMp下project.config.json中的projectname
    // todo，现在这个是在wechatMp/src目录下的，可能是搞错了，待修正
    const pcjFilePath = join(dir, 'wechatMp', 'src', 'project.config.json');
    const pcjJson = require(pcjFilePath);
    pcjJson.projectname = title;
    const newPcjContent = JSON.stringify(pcjJson, undefined, 4);
    writeFileSync(pcjFilePath, newPcjContent);

    // replace native下的相关数据
    const cwd = process.cwd();
    process.chdir(join(dir, 'native'));
    await changePlaceholderInTemplate({
        projectName: name,
        projectTitle: title,
        placeholderName,
        placeholderTitle,
    });
    process.chdir(cwd);

    Success(
        `${success(
            `Change project name to ${primary(
                name
            )}, project title to ${primary(title)}`
        )}`
    );
}

export async function rename(cmd: any) {
    const { projectName, displayName } = cmd;
    // todo 取native/android下的name和title作为placeholder，再调用renameProject
}

/* changePlaceholderInTemplate({
    projectName: 'taicang',
    projectTitle: '太藏',
    placeholderName: 'oak-template',
    placeholderTitle: 'oak template project',    
}).then(
    () => console.log('success')
); */