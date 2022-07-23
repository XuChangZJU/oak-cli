import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.less';
import LazyLoad from './utils/lazyLoad';
const Console = LazyLoad(() => import('./template/console'));
const Frontend = LazyLoad(() => import('./template/frontend'));
const NotFound = LazyLoad(() => import('./template/notFound'));
const Message = LazyLoad(() =>import('@oak-general-business/components/message'));

type Router = {
    path: string;
    element: ReturnType<typeof LazyLoad>;
    title: string;
}

function getRoutes(routers2: Router[], namespace?: string) {
    return routers2.map((router, index) => {
        const { path, element } = router;
        return (
            <Route
                key={`route_${namespace ? `${namespace}_` : ''}${index}`}
                path={path}
                element={element}
            ></Route>
        );
    });
}
// routers非常重要，不能删除
let routers: Router[] = [];

function App() {
    return (
        <React.Fragment>
            {Message}
            <Routes>
                <Route path="/console" element={Console}>
                    {getRoutes(routers, 'console')}
                </Route>
                <Route path="/" element={Frontend}>
                    {getRoutes(routers)}
                </Route>
                <Route path="*" element={NotFound} />
            </Routes>           
        </React.Fragment>
    );
}

export default App;
