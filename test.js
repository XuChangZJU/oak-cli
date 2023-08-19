
const { parseSync, transformFromAstSync } = require('@babel/core');
const t = require('@babel/types');
const assert = require('assert');
const traverse = require('@babel/traverse').default;

function codeChunkIncludesT(text) {
    return /{{(\w|\W)*\W*t\((\w|\W)+\)(\w|\W)*}}/g.test(text)
}

function transformCode(text, namespace, moduleName) {
    const codeChunkRegex = /(?:\{\{|%\{)(.*?)(?:\}\}?)/gm;
    const matches = text.match(codeChunkRegex);
    if (!matches) {
        return text;
    }

    let text2 = text;
    while (matches.length) {
        const codeChunk = matches.shift();
        if (codeChunkIncludesT(codeChunk)) {
            const codeContent = codeChunk.replace(codeChunkRegex, "$1");
            const ast = parseSync(codeContent);
            traverse(ast, {
                enter(path) {
                    if (path.isCallExpression()) {
                        const { node } = path;
                        if (t.isIdentifier(node.callee) && node.callee.name === 't') {
                            const { arguments } = node;
                            // 在t的后面加五个参数（oakLocales, oakLng, oakDefaultLng, oakNamespace, oakModule）
                            arguments.push(
                                t.identifier('oakLocales'),
                                t.identifier('oakLng'),
                                t.identifier('oakDefaultLng'),
                                t.stringLiteral(namespace),
                                t.stringLiteral(moduleName)
                            );
                            node.callee = t.memberExpression(
                                t.identifier('i18n'),
                                t.identifier('t')
                            );
                        }
                    }
                },
            });
            const { code } = transformFromAstSync(ast);
            assert(code.endsWith(';'));
            
            text2 = text2.replace(codeContent, code.slice(0, code.length - 1));
        }
    }
    return text2;
    /* const ast = parseSync(t2);
    traverse(ast, {
        enter(path) {
            if (path.isCallExpression()) {
                const { node } = path;
                if (t.isIdentifier(node.callee) && node.callee.name === 't') {
                    const { arguments } = node;
                    // 在t的后面加五个参数（oakLocales, oakLng, oakDefaultLng, oakNamespace, oakModule）
                    arguments.push(
                        t.identifier('oakLocales'),
                        t.identifier('oakLng'),
                        t.identifier('oakDefaultLng'),
                        t.stringLiteral(namespace),
                        t.stringLiteral(moduleName)
                    );
                    node.callee = t.memberExpression(
                        t.identifier('i18n'),
                        t.identifier('t')
                    );
                }
            }
        },
    });
    const { code } = transformFromAstSync(ast);
    assert(code.endsWith(';'));
    return `{{${code.substring(0, code.length - 1)}}}`; */
}

function getRelativePath(filepath) {
    const relativePath = filepath.replace(/\\/g, '/').replace(/(\w|\W)*(\/pages\/|\/components\/)((\w|\W)*)/g, '$3');
    return relativePath;
}

function getProjectPath(filepath) {
    const path = filepath.replace(/\\/g, '/').replace(/((\w|\W)*)(\/src|\/lib)(\/pages\/|\/components\/)((\w|\W)*)/g, '$1');
    return path;
}


console.log(transformCode("只显示{{t('house')}}和{{t('house')}}", 'ns', 'module'));
// console.log(getProjectPath('D:\\git\\taicang\\src\\pages\\home\\index.xml'));