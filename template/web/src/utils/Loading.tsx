
import React, { useEffect } from 'react';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

function Loading() {
    //componentDidMount
    useEffect(() => {
        NProgress.start();
    }, []);
    //componentWillUnmount
    useEffect(() => {
        return () => {
            NProgress.done();
        };
    }, []);

    return null;
}

export default Loading