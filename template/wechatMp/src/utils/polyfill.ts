import '@oak-frontend-base/utils/wx.polyfill';
Object.assign(global, {
    /**
     * 封装wx环境下的fetch，注意有部分属性并非完全吻合，请谨慎使用
     * @param url
     * @param options
     * @returns
     */
    fetch: async (
        url: string,
        options?: Parameters<typeof global.fetch>[1]
    ) => {
        const params = Object.assign(
            {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                },
            },
            options
        );
        const { method, headers, body } = params;

        let responseType: 'arraybuffer' | 'text' | undefined;
        const accept = (headers as Record<string, string>)['Accept'];
        if (
            [
                'image/jpg',
                'image/jpeg',
                'image/png',
                'application/octet-stream',
            ].includes(accept)
        ) {
            responseType = 'arraybuffer';
        } else {
            responseType = 'text';
        }
        const dataType = '其他';

        return new Promise((resolve, reject) => {
            wx.request({
                url,
                data: body || {},
                method: method as any,
                header: headers,
                dataType,
                responseType,
                success: (res) => {
                    const { statusCode, data, header } = res;
                    header.get = function (key: string) {
                        return this[key] as any;
                    };
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
        });
    },
    getRandomValues: async function getRandomValues(length: number) {
        if (length > 65536) {
            throw new Error('Can only request a maximum of 65536 bytes');
        }

        const { randomValues } = await wx.getRandomValues({
            length,
        });
        return new Uint8Array(randomValues);
    },
});
