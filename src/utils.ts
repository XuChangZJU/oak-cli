
/**
 * @name 从一组路径里查找到所有json文件
 * @export
 * @param {Array<string>} pathArr
 * @returns {Set<string>}
 */
export function findJson(pathArr: Set<string>): Set<string> {
    const result: Set<string> = new Set()
    for (let item of pathArr) {
        const endIndex = item.length
        const str = item.substring(endIndex - 5, endIndex)
        if (str === '.json') {
            result.add(item)
        }
    }
    return result
}

/**
 * @name 已知前后文取中间文本
 * @export
 * @param {string} str
 * @param {string} start
 * @param {string} end
 * @returns {(string | null)}
 */
export function getStr(str: string, start: string, end: string): string | null {
    const reg = new RegExp(`${start}(.*?)${end}`)
    let res = str.match(reg)
    return res ? res[1] : null
}

/**
 * @name 差集
 * @export
 * @template T
 * @param {Set<T>} current
 * @param {Set<T>} target
 * @returns {Set<T>}
 */
export function difference<T>(current: Set<T>, target: Set<T>): Set<T> {
    return new Set(
        [...target].filter(x => !current.has(x))
    )
}

/**
 * @name 获取交集
 * @export
 * @template T
 * @param {Set<T>} current
 * @param {Set<T>} target
 * @returns {Set<T>}
 */
export function intersect<T>(current: Set<T>, target: Set<T>): Set<T> {
    return new Set([...target].filter(x => current.has(x)))
}

/**
 * @name 获取并集
 * @export
 * @template T
 * @param {Set<T>} current
 * @param {Set<T>} target
 * @returns {Set<T>}
 */
export function union<T>(current: Set<T>, target: Set<T>): Set<T> {
    return new Set([...current, ...target])
}

/**
 * @name 格式化json
 * @export
 * @template T
 * @param {T} data
 * @returns {string}
 */
export function formatJsonByFile<T extends Object>(data: T): string {
    return JSON.stringify(data, null, 2)
}

/**
 * @name 数组对象去重
 * @export
 * @param {Array<any>} arr 需要去重的数组或set
 * @param {*} [type] 需要根据哪个字段去重
 * @returns
 */
export function deWeight(arr: Array<any> | Set<any>, type: any) {
    let map = new Map();
    for (let item of arr) {
        if (!map.has(item[type])) {
            map.set(item[type], item);
        }
    }
    return new Set([...map.values()]);
}
