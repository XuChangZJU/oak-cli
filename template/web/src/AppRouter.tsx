import React from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { IRouter, IBrowserRouterProps, IMeta } from './types/router';
import routers, { Folder } from './routers';
import Loading from './components/Loading';
import useFeatures from '@project/hooks/useFeatures';

type TRenderRoutes = (
    routes?: IRouter[],
    breadcrumbs?: string[]
) => React.ReactNode[] | null;

/**
 * 渲染应用路由
 * @param routes
 * @param breadcrumb
 */
const renderRoutes: TRenderRoutes = (routes = [], breadcrumb = []) => {
    if (routes.length === 0) return null;
    return routes.map((route, index: number) => {
        const { Component, children, namespace, meta, isFirst, customRouter } =
            route;
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
                        breadcrumb={currentBreadcrumb}
                        namespace={namespace}
                        customRouter={customRouter}
                    />
                }
            >
                {renderRoutes(children, currentBreadcrumb)}
            </Route>
        );
    });
};

const Guard = React.memo(
    (props: {
        Component?: React.FC<IBrowserRouterProps> | (() => any);
        namespace?: string;
        meta?: IMeta;
        breadcrumb: string[];
        customRouter?: boolean;
    }) => {
        const { Component, namespace, meta, breadcrumb, customRouter } = props;
        const features = useFeatures();
        const location = useLocation();
        const { pathname } = location;
        const path = namespace ? pathname.slice(namespace.length) : pathname;
        const i18nNs = `taicang-p-${
            path.startsWith('/')
                ? path.slice(1).replaceAll(/\//g, '-')
                : path.replaceAll(/\//g, '-')
        }`;

        if (i18nNs) {
            const windowTitle = features.locales.hasKey(`${i18nNs}.pageTitle`);
            if (windowTitle) {
                breadcrumb.push(windowTitle);
                window.document.title = windowTitle;
            }
        }

        return Component ? (
            <React.Suspense fallback={<Loading />}>
                <Component
                    oakDisablePulldownRefresh={meta?.oakDisablePulldownRefresh}
                    namespace={namespace || ''}
                    customRouter={customRouter}
                />
            </React.Suspense>
        ) : (
            <Outlet />
        );
    }
);

const AppRouter = React.memo((props: { folder: Folder }) => (
    <Routes>{renderRoutes(routers[props.folder])}</Routes>
));

export default AppRouter;
