import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Button, Drawer } from 'tdesign-react';
import { ChevronUpIcon } from 'tdesign-icons-react'

import './App.less';
import LazyLoad from './utils/lazyLoad';
const Console = LazyLoad(() => import('./template/console'));
const Frontend = LazyLoad(() => import('./template/frontend'));
const NotFound = LazyLoad(() => import('./template/notFound'));
const Message = LazyLoad(() => import('@oak-general-business/components/message'));
const DebugPanel = LazyLoad(() => import('@oak-general-business/components/Func/debugPanel'));

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
    const [visible, setVisible] = useState(false);

    const handleClick = () => {
        setVisible(true);
    };
    const handleClose = () => {
        setVisible(false);
    };
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
            {
                process.env.NODE_ENV === "development" && (
                    <React.Fragment>
                        <Button
                            variant="text"
                            shape="circle"
                            theme="primary"
                            icon={<ChevronUpIcon />}
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                right: '45vw',
                            }}
                            onClick={handleClick}
                        />

                        <Drawer
                            placement="bottom"
                            visible={visible}
                            onClose={handleClose}
                            header={<text>debug控制台</text>}
                            footer={<div/>}
                        >
                            {DebugPanel}
                        </Drawer>
                    </React.Fragment>
                )
            }
        </React.Fragment>
    );
}

export default App;
