
/**
 * 封装wx环境下的fetch，注意有部分属性并非完全吻合，请谨慎使用
 * @param url 
 * @param options 
 * @returns 
 */
const fetch2 = async (url: string, options?: Parameters<typeof fetch>[1]) => {
    const params = Object.assign({
        method: 'GET',
        dataType: '其他',
        responseType: 'text',
        headers: {
            'Content-type': 'application/json',
        },
    }, options);
    const { method, headers, dataType, responseType, body } = params;

    let responseType2 = responseType;
    if ((headers as Record<string, string>)['Accept'] === 'application/octet-stream') {
        responseType2 = 'arraybuffer';
    }

    if (!['text', 'arraybuffer'].includes(responseType2)) {
        throw new Error(`传入不支持的responseType: ${responseType2}`);
    }

    let dataType2 = dataType === 'json' ? dataType : '其他';
    if (responseType2 === 'arraybuffer') {
        dataType2 = '其他';
    }

    return new Promise(
        (resolve, reject) => {                
            wx.request({
                url,
                data: body || {},
                method: method as any,
                header: headers,
                dataType: dataType2 as any,
                responseType: responseType2 as any,
                success: (res) => {
                    const { statusCode, data, header } = res;
                    const result = Object.assign({}, res, {
                        status: statusCode,
                        ok: statusCode === 200,
                        headers: header,
                        arrayBuffer: async () => data as ArrayBuffer,
                        json: async () => JSON.parse(data as string),
                        text: async () => data as string,
                        clone: () => result!,
                        url,
                        statusText: statusCode === 200 ? 'ok' : 'error',
                    });
                    return resolve(result);
                },
                fail: reject,
            });
        }
    );
}

Object.assign(global, {
    fetch: fetch2,
});