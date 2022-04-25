/**
 *
 * @param {*} content 文件信息
 */
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom')

function traverse(doc, callback) {
    callback(doc);
    if (doc.childNodes) {
        const { length } = doc.childNodes;
        for (let i = 0; i < length; i ++) {
            traverse(doc.childNodes.item(i), callback);
        }
    }
}

module.exports = function (content) {
    //console.log(content);
    const doc = new DOMParser().parseFromString(content, 'text/xml');
    traverse(doc, (node) => {
        if (node.nodeType === node.ELEMENT_NODE) {
            // 处理oak:value声明的属性
            if (node.hasAttribute('oak:value')) {
                const oakValue = node.getAttribute('oak:value');
                node.removeAttribute('oak:value');
                node.setAttribute('value', `{{${oakValue}}}`);
                node.setAttribute('data-path', oakValue);

                if (node.hasAttribute('oak:forbidFocus')) {
                    node.removeAttribute('oak:forbidFocus');
                }
                else {
                    node.setAttribute('focus', `{{!!oakFocused.${oakValue}}}`);
                }
            }
        }
    });

    const serialized = new XMLSerializer().serializeToString(doc);
    return serialized;
};
