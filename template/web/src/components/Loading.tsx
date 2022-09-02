import React, { useEffect, memo } from 'react';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css';


export default memo(() => {
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
});