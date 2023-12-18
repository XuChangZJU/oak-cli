import React, { lazy } from 'react';
import { Button, Space } from 'antd';

import {
    OakException,
    OakExternalException,
    OakNetworkException,
    OakServerProxyException,
} from 'oak-domain/lib/types/Exception';
import { OakTokenExpiredException } from 'oak-general-business';
import { ECode } from 'oak-general-business/es/types/ErrorPage';
const ErrorPage = lazy(
    () => import('oak-general-business/es/components/common/errorPage')
);

interface ErrorProps {
    error: any;
}

function Error(props: ErrorProps) {
    const { error } = props;

    if (error instanceof OakException) {
        if (error instanceof OakTokenExpiredException) {
            return (
                <ErrorPage
                    code={ECode.error}
                    title="登录失效"
                    desc="抱歉，登录信息失效，请点击【重新加载】"
                >
                    <Space>
                        <Button
                            type="primary"
                            onClick={async () => {
                                (global as any).features.token.removeToken();
                                window.location.reload();
                            }}
                        >
                            重新加载
                        </Button>
                    </Space>
                </ErrorPage>
            );
        }
        if (error instanceof OakNetworkException) {
            // 网络中断出现的异常
            return (
                <ErrorPage
                    code={ECode.error}
                    title="网络异常"
                    desc="抱歉，网络访问失败！"
                >
                    <ErrorMessage error={error} />
                    <Button
                        type="primary"
                        onClick={async () => {
                            window.location.reload();
                        }}
                    >
                        检查网络
                    </Button>
                </ErrorPage>
            );
        }
        if (error instanceof OakServerProxyException) {
            // 服务器代理异常
            return (
                <ErrorPage
                    code={ECode.error}
                    title="服务器代理异常"
                    desc="抱歉，服务器代理出现错误！"
                >
                    <ErrorMessage error={error} />
                    <Button
                        type="primary"
                        onClick={async () => {
                            window.location.reload();
                        }}
                    >
                        检查服务器代理
                    </Button>
                </ErrorPage>
            );
        }

        return (
            <ErrorPage
                code={ECode.error}
                title="系统内部错误"
                desc="抱歉，系统内部错误，我们的技术人员正在快马加鞭的修复"
            >
                <ErrorMessage error={error} />
                <Button
                    type="primary"
                    onClick={async () => {
                        window.location.reload();
                    }}
                >
                    联系我们
                </Button>
            </ErrorPage>
        );
    }

    return (
        <ErrorPage
            code={ECode.error}
            title="数据缓存失效"
            desc="抱歉，数据缓存失效，需要清除缓存，请点击【清除缓存】"
        >
            <ErrorMessage error={error} />
            <Button
                type="primary"
                onClick={async () => {
                    (global as any).features.localStorage.clear();
                    window.location.reload();
                }}
            >
                清除缓存
            </Button>
        </ErrorPage>
    );
}

function ErrorMessage(props: { error: any }) {
    const { error } = props;
    if (process.env.NODE_ENV === 'development') {
        return (
            <span
                style={{
                    marginBottom: 24,
                    color: 'red',
                    fontSize: 14,
                    marginLeft: 24,
                    marginRight: 24,
                }}
            >
                {typeof error === 'object' ? error.message : error}
            </span>
        );
    }
    return null;
}

export default Error;
