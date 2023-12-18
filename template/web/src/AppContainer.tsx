import React, { lazy } from 'react';
const Message = lazy(() => import('oak-general-business/es/components/message'));
const DebugPanel = lazy(
    () => import('oak-general-business/es/components/func/debugPanel')
);

type AppContainerProps = {
    children?: React.ReactNode;
};

const AppContainer = (props: AppContainerProps) => {
    const { children } = props;
    return (
        <React.Fragment>
            <React.Suspense fallback={<></>}>
                <Message />
            </React.Suspense>
            {children}
            <React.Suspense fallback={<></>}>
                {process.env.NODE_ENV === 'development' && <DebugPanel />}
            </React.Suspense>
        </React.Fragment>
    );
};

export default AppContainer;
