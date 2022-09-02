import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.less';
import AppContainer from './AppContainer';

const Console = React.lazy(() => import('./components/console'));
const Frontend = React.lazy(() => import('./components/frontend'));
const NotFound = React.lazy(() => import('./components/notFound'));

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
                element={<Component namespace={namespace} />}
            ></Route>
        );
    });
}
// routers非常重要，不能删除
let routers: Router[] = [];

function App() {
    return (
        <AppContainer>
            <Routes>
                <Route path="/console" element={<Console />}>
                    {getRoutes(routers, 'console')}
                </Route>
                <Route path="/" element={<Frontend />}>
                    {getRoutes(routers)}
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AppContainer>
    );
}

export default App;
