import React from "react";
import Loading from './Loading';

const LazyLoad = (factory: () => Promise<{ default: any }>) => {
    const Component = React.lazy(factory);
    return (
        <React.Suspense fallback={<Loading />}>
            <Component />
        </React.Suspense>
    );
};

export default LazyLoad;