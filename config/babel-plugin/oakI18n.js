const fs = require('fs');
const { relative, resolve, join, dirname } = require('path');
const t = require('@babel/types');
const assert = require('assert');
const { fork } = require('child_process');

const Regex =
    /([\\/]*[a-zA-Z0-9_-\w\W]|[\\/]*[a-zA-Z0-9_-\w\W]:)*[\\/](lib|src|es)([\\/]*[a-zA-Z0-9_-])*[\\/](pages|components)+[\\/]/;


const ModuleDict = {};
const ReactNativeProjectDict = {};

const ProcessRecord = {};

function parseFileModuleAndNs(cwd, filename) {
    let cwd2 = cwd;
    if (cwd.endsWith('native')) {
        // react-native环境，需要重新定位一下项目根目录
        if (ReactNativeProjectDict.hasOwnProperty(cwd)) {
            if (ReactNativeProjectDict[cwd]) {
                cwd2 = join(cwd, '..');
            }
        }
        else {
            const nodeModulePath = join(cwd, '..', 'node_modules');
            const packageJsonPath = join(cwd, '..', 'package.json');
            if (fs.existsSync(packageJsonPath) && fs.existsSync(nodeModulePath)) {
                ReactNativeProjectDict[cwd] = true;
                cwd2 = join(cwd, '..');
            }
            else {
                ReactNativeProjectDict[cwd] = false;
            }
        }
    }
    const relativePath = relative(cwd2, filename);
    if (relativePath.startsWith('node_modules') || relativePath.startsWith('..')) { // 在测试环境下是相对路径
        // 寻找离filename最近层的package.json，看作项目名称
        // 用relativePath来递进查找在操作系统层面更安全
        const fileDirPaths = relativePath.replace(/\\/g, '/').split('/');

        let iter = fileDirPaths.length;
        let filePrjRootPath = '';
        let moduleName = '';
        do {
            filePrjRootPath = join(cwd2, ...fileDirPaths.slice(0, iter));
            const pkgJsonPath = join(filePrjRootPath, 'package.json');

            if (fs.existsSync(pkgJsonPath)) {
                moduleName = ModuleDict[filePrjRootPath];
                if (!moduleName) {
                    const { name } = require(pkgJsonPath);
                    moduleName = name;
                    ModuleDict[filePrjRootPath] = name;
                }
                break;
            }
            else {
                assert(iter > 0);
                iter--;
            }
        } while (true);

        // 引用的第三方项目目前合法的只有components下的组件，pages是容一些较早的遗留代码
        const fileRelPathInPrj = relative(filePrjRootPath, filename).replace(/\\/g, '/').split('/');;
        let ns;
        switch (fileRelPathInPrj[1]) {
            case 'pages': {
                ns = `${moduleName}-p-${fileRelPathInPrj.slice(2, fileRelPathInPrj.length - 1).join('-')}`;
                break;
            }
            default: {
                if (fileRelPathInPrj[1] !== 'components') {
                    assert(false);
                }
                assert(fileRelPathInPrj[1] === 'components', fileRelPathInPrj.join('//'));
                ns = `${moduleName}-c-${fileRelPathInPrj.slice(2, fileRelPathInPrj.length - 1).join('-')}`;
                break;
            }
        }

        return {
            moduleName,
            ns,
        };
    }
    else {
        let moduleName = ModuleDict['./'];
        if (!moduleName) {
            const { name } = require(join(cwd2, 'package.json'));
            ModuleDict['./'] = name;
            moduleName = name;
        }

        const rel2paths = relative(cwd2, filename)
            .replace(/\\/g, '/')
            .split('/');

        let ns;
        switch (rel2paths[1]) {
            case 'pages': {
                ns = `${moduleName}-p-${rel2paths.slice(2, rel2paths.length - 1).join('-')}`;
                break;
            }
            case 'components': {
                ns = `${moduleName}-c-${rel2paths.slice(2, rel2paths.length - 1).join('-')}`;
                break;
            }
            default: {
                // 处理web/wechatMp中的数据
                assert(rel2paths[1] === 'src');
                const p1 = rel2paths[0];
                if (p1 === 'web') {
                    ns = `${moduleName}-w-${rel2paths.slice(2, rel2paths.length - 1).join('-')}`;
                }
                else if (p1 === 'wechatMp') {
                    ns = `${moduleName}-wmp-${rel2paths.slice(2, rel2paths.length - 1).join('-')}`;
                }
                else {
                    assert(p1.startsWith('wechatMp'));
                    const iter = parseInt(p1.slice(8), 10);
                    ns = `${moduleName}-wmp${iter}-${rel2paths.slice(2, rel2paths.length - 1).join('-')}`;
                }
                break;
            }
        }

        return {
            moduleName,
            ns,
        };
    }
}

const oakNsPropName = '#oakNamespace';
const oakModulePropName = '#oakModule';

module.exports = (babel) => {
    return {
        visitor: {
            CallExpression(path, state) {
                const { cwd, filename  } = state;
                const res = resolve(cwd, filename).replace(/\\/g, '/');
                // this.props.t/this.t/t
                // 处理策略为给第二个参数中加上'#oakNameSpace, #oakModule两个参数，告知t模块此文件相应的位置，再加以处理寻找
                if (
                    /(pages|components|namespaces)[\w|\W]+(.tsx|.ts|.jsx|.js)$/.test(res)
                ) {
                    const { node } = path;
                    if (
                        node &&
                        node.callee &&
                        ((t.isIdentifier(node.callee) &&
                            node.callee.name === 't') ||
                            (t.isMemberExpression(node.callee) &&
                                t.isIdentifier(node.callee.property) &&
                                node.callee.property.name === 't'))
                    ) {
                        const { moduleName, ns } = parseFileModuleAndNs(cwd, filename);
                        const arguments = node.arguments;

                        // react-native会调用两次，这里要保护一下
                        // 代码看上去可以避免被调用两次，rn待测试  by Xc 20240108
                        const [arg0, arg1] = arguments;
                        assert(arg0);

                        if (arg1) {
                            // 一般是对象，也可能是变量，表达式不予考虑
                            if (t.isObjectExpression(arg1)) {
                                const { properties } = arg1;
                                const oakNsProp = properties.find(
                                    ele => t.isStringLiteral(ele.key) && ele.key.value === oakNsPropName
                                );
                                if (!oakNsProp) {
                                    properties.push(
                                        t.objectProperty(t.stringLiteral(oakNsPropName), t.stringLiteral(ns)),
                                        t.objectProperty(t.stringLiteral(oakModulePropName), t.stringLiteral(moduleName))
                                    );
                                }
                            }
                            else if (t.isIdentifier(arg1)) {
                                arguments.splice(1, 1, t.callExpression(
                                    t.memberExpression(
                                        t.identifier('Object'),
                                        t.identifier('assign')
                                    ),
                                    [
                                        arg1,
                                        t.objectExpression(
                                            [
                                                t.objectProperty(t.stringLiteral(oakNsPropName), t.stringLiteral(ns)),
                                                t.objectProperty(t.stringLiteral(oakModulePropName), t.stringLiteral(moduleName))                                                
                                            ]
                                        )
                                    ]
                                ));
                            }
                            else {
                                // 不处理，这里似乎会反复调用，不知道为什么
                            }
                        }
                        else {
                            // 如果无参数就构造一个对象传入
                            arguments.push(
                                t.objectExpression(
                                    [
                                        t.objectProperty(t.stringLiteral(oakNsPropName), t.stringLiteral(ns)),
                                        t.objectProperty(t.stringLiteral(oakModulePropName), t.stringLiteral(moduleName))                                                
                                    ]
                                )
                            );
                        }
                    }
                }
            },
        },
    };
};