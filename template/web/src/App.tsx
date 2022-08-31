import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.less';
import Loading from './components/Loading';
const Console = React.lazy(() => import('./components/console'));
const Frontend = React.lazy(() => import('./components/frontend'));
const NotFound = React.lazy(() => import('./components/notFound'));
const Message = React.lazy(() => import('@oak-general-business/components/message'));
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
        <React.Suspense>
            <Message />
            <Routes>
                <Route path="/console" element={<Console />}>
                    {getRoutes(routers, 'console')}
                </Route>
                <Route path="/" element={<Frontend />}>
                    {getRoutes(routers)}
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
            {process.env.NODE_ENV === 'development' && <DebugPanel />}
        </React.Suspense>
    );
}

export default App;
