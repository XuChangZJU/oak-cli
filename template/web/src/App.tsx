import React from 'react';

import './App.less';
import AppContainer from './AppContainer';
import AppRouter from './AppRouter';
import AppError from './AppError';
import { Folder } from './routers';

function App(props: { folder: Folder; error?: any }) {
    if (props.error) {
        return <AppError error={props.error} />;
    }
    return (
        <AppContainer>
            <AppRouter folder={props.folder} />
        </AppContainer>
    );
}

export default App;
