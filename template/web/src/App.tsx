import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.less';
import Loading from './components/Loading';
const Console = React.lazy(() => import('./components/console'));
const Frontend = React.lazy(() => import('./components/frontend'));
const NotFound = React.lazy(() => import('./components/notFound'));
//@ts-ignore
const Message = React.lazy(() => import('@oak-general-business/components/message'));
//@ts-ignore
const DebugPanel = React.lazy(() => import('@oak-general-business/components/func/debugPanel'));

type Router = {
    path: string;
    element: React.LazyExoticComponent<React.ComponentType<any>>;
    title: string;
};

function getRoutes(routers2: Router[], namespace?: string) {
    return routers2.map((router, index) => {
        const { path, element: Component } = router;
        return (
            <Route
                key={`route_${namespace ? `${namespace}_` : ''}${index}`}
                path={path}
                element={
                    <React.Suspense fallback={<Loading />}>
                        <Component namespace={namespace} />
                    </React.Suspense>
                }
            ></Route>
        );
    });
}
// routers非常重要，不能删除
let routers: Router[] = [];

function App() {
    return (
        <React.Fragment>
            <React.Suspense>
                <Message />
            </React.Suspense>
            <Routes>
                <Route
                    path="/console"
                    element={
                        <React.Suspense fallback={<Loading />}>
                            <Console />
                        </React.Suspense>
                    }
                >
                    {getRoutes(routers, 'console')}
                </Route>
                <Route
                    path="/"
                    element={
                        <React.Suspense fallback={<Loading />}>
                            <Frontend />
                        </React.Suspense>
                    }
                >
                    {getRoutes(routers)}
                </Route>
                <Route
                    path="*"
                    element={
                        <React.Suspense fallback={<Loading />}>
                            <NotFound />
                        </React.Suspense>
                    }
                />
            </Routes>
            {process.env.NODE_ENV === 'development' && (
                <React.Suspense>
                    <DebugPanel />
                </React.Suspense>
            )}
        </React.Fragment>
    );
}

export default App;
