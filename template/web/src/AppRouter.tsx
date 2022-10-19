import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import routers, { IRouter, IBrowserRouterProps } from './router/index';
import Loading from './components/Loading';

type TRenderRoutes = (
    routes?: IRouter[],
    breadcrumbs?: string[],
) => React.ReactNode[] | null;

/**
 * 渲染应用路由
 * @param routes
 * @param breadcrumb
 */
const renderRoutes: TRenderRoutes = (
    routes = [],
    breadcrumb = [],
) => {
    if (routes.length === 0) return null;
    return routes.map((route, index: number) => {
        const { Component, children, meta, namespace, isFirst } = route;
        let currentBreadcrumb = breadcrumb;
        let props = {};
        if (isFirst) {
            props = {
                index: true,
            };
        } else {
            props = {
                path: route.path,
            };
        }
        return (
            <Route
                {...props}
                key={index}
                element={
                    <Guard
                        Component={Component}
                        meta={meta}
                        namespace={namespace}
                        breadcrumb={currentBreadcrumb}
                    />
                }
            >
                {renderRoutes(children, currentBreadcrumb)}
            </Route>
        );
    });
}

const Guard = React.memo((props: {
    Component?: React.FC<IBrowserRouterProps> | (() => any);
    namespace?: string;
    meta?: Record<string, any>;
    breadcrumb: string[];
}) => {
    const { Component, namespace, meta, breadcrumb } = props;
    if (meta?.title) {
        breadcrumb.push(meta?.title);
        window.document.title = meta?.title;
    }

    return Component ? (
        <React.Suspense fallback={<Loading />}>
            <Component
                enablePullDownRefresh={meta?.enablePullDownRefresh}
                namespace={namespace}
            />
        </React.Suspense>
    ) : (
        <Outlet />
    );
});   

const AppRouter = React.memo(() => <Routes>{renderRoutes(routers)}</Routes>);

export default AppRouter;
