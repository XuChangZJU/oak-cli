import { BrowserRouterProps } from 'react-router-dom';
export interface IBrowserRouterProps extends BrowserRouterProps {
    namespace?: string;
    enablePullDownRefresh?: boolean;
}

export interface IRouter {
    path: string;
    /**
     * 是否为根路由
     */
    isFirst?: boolean;
    namespace?: string;
    Component?: React.FC<IBrowserRouterProps> | (() => any);
    /**
     * 当前路由是否全屏显示
     */
    isFullPage?: boolean;
    /**
     * meta
     */
    meta?: {
        title?: string;
        Icon?: React.FC;
        /**
         * 侧边栏隐藏该路由
         */
        hidden?: boolean;
        auth?: boolean;
        enablePullDownRefresh?: boolean;
    };
    children?: IRouter[];
}

let allRouters: IRouter[] = [];
// 项目路径别名
type Project = '@project' | '@oak-general-business';
//路径path
type FilePath = '@oak-general-business/pages/result/404';
// 嵌套路由顶层path
type Namespaces =
    | '/console'
    | '/'
// 路由path
type RoutePath = string;
//禁用 对Project和RouterPath进行组装 默认false，传入true，就不会组装，直接FilePath
type DisableAssemble = boolean | undefined | null;
// 设置根路由
type IsFirst = boolean;
type Namespace = Array<Namespaces> | [] | undefined | null | '';
// [路径别名｜路径path， 路由path，[嵌套路由顶层path]，设置根路由, 禁用拼装]
type Page = [
    Project | FilePath,
    RoutePath,
    Namespace?,
    IsFirst?,
    DisableAssemble?
];

const namespaces: Record<Namespaces, string> = {
    '/console': './../components/console',
    '/': './../components/frontend',
};

const pages: Array<Page> = [
    ['@oak-general-business', '/login'],
    ['@project', '/book/list', ['/', '/console']],

    ['@oak-general-business/pages/result/404', '*', undefined, false, true], // 放在数组最后
];

export default allRouters;
