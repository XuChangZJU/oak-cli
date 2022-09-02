import React, { lazy } from 'react';
import Loading from './components/Loading';
const Message = lazy(() => import('@oak-general-business/components/message'));
const DebugPanel = lazy(() => import('@oak-general-business/components/func/debugPanel'));

type AppContainerProps = {
    children?: React.ReactNode
};

const AppContainer = (props: AppContainerProps) => {
    const { children } = props;
    return (
        <React.Suspense fallback={<Loading />}>
            <Message />
            {children}
            {process.env.NODE_ENV === 'development' && <DebugPanel />}
        </React.Suspense>
    );
};

export default AppContainer;