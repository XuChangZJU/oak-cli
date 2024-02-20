import { EntityDict } from '@project/oak-app-domain';
import { Feature } from 'oak-frontend-base';
import { CommonAspectDict } from 'oak-common-aspect';
import { AspectDict } from '../aspects/AspectDict';
import { BackendRuntimeContext } from '@project/context/BackendRuntimeContext';
import { FrontendRuntimeContext } from '@project/context/FrontendRuntimeContext';
import { groupBy } from 'oak-domain/lib/utils/lodash';
import { ContextMenuFactory } from 'oak-frontend-base/es/features/contextMenuFactory';
import Console from './Console';

type GroupName = 'System';

type Groups = {
    icon: string;
    name: GroupName;
}[];

interface IMenu<T extends keyof EntityDict> {
    name: string;
    icon: string;
    url: string;
    entity?: T;
    paths?: string[];
    action?: EntityDict[T]['Action'];
    parent?: GroupName;
};

export interface OMenu {
    name: GroupName | string;
    icon: string;
    url?: string;
    children?: Array<OMenu>;
};


const groups: Groups = [
    {
        name: 'System',     //  系统级别配置
        icon: 'setup_fill',
    },
];

const menus: IMenu<keyof EntityDict>[] = [
    {
        name: 'Dashboard',
        icon: 'document',
        url: '',
    },
    {
        name: 'relationManage',
        icon: 'share',
        url: '/relation/entityList',
        parent: 'System',
        entity: 'relation',
        action: 'create',
        paths: [],
    },
];

export default class Menu extends Feature {
    private contextMenuFactory: ContextMenuFactory<EntityDict,
        BackendRuntimeContext,
        FrontendRuntimeContext,
        AspectDict & CommonAspectDict<EntityDict, BackendRuntimeContext>>;
    private console: Console;
    private menus?: OMenu[];

    constructor(
        contextMenuFactory: ContextMenuFactory<EntityDict,
            BackendRuntimeContext,
            FrontendRuntimeContext,
            AspectDict & CommonAspectDict<EntityDict, BackendRuntimeContext>>,
        console: Console
    ) {
        super();
        this.contextMenuFactory = contextMenuFactory;
        this.contextMenuFactory.setMenus(menus);
        this.console = console;
        this.console.subscribe(
            () => {
                this.refreshMenus();
            }
        );
    }

    refreshMenus() {
        const roomId = this.console.getRoomId();
        const menus = this.contextMenuFactory.getMenusByContext<IMenu<keyof EntityDict>>('room', roomId);
        const menuGroup = groupBy(menus, 'parent');
        this.menus = (menus as any[]).filter(ele => !ele.parent).concat(
            groups.map((ele) => {
                const { name, icon } = ele;
                const children = menuGroup[name];
                return {
                    name,
                    icon,
                    children,
                };
            }).filter((ele) => !!ele.children)
        );
        this.publish();
    }

    getMenus() {
        if (!this.menus) {
            this.refreshMenus();
        }
        return this.menus;
    }
}
