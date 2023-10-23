import React, { useState, useRef } from 'react';
import Style from './web.pc.module.less';
import { WebComponentProps } from 'oak-frontend-base';
import { EntityDict } from '@oak-app-domain';

export default function Render(props: WebComponentProps<EntityDict, 'store', false, {}, {}>) {
    const { t } = props.methods;
    const { data } = props;

    return <div className={Style.container}></div>;
}
