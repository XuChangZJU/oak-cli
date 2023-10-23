import { BrowserRouterProps } from 'react-router-dom';

export interface IBrowserRouterProps extends BrowserRouterProps {
    namespace: string;
    oakDisablePulldownRefresh?: boolean;
    navigationBarTitleText?: string;
    customRouter?: boolean; //表示自定义路由
}

export type IMeta = {
    navigationBarTitleText?: string;
    Icon?: React.FC;
    oakDisablePulldownRefresh?: boolean;
}

export interface IRouter {
    path: string;
    /**
     * 是否为根路由
     */
    isFirst?: boolean;
    namespace?: string;
    customRouter?: boolean; //表示自定义路由
    Component?: React.FC<IBrowserRouterProps> | (() => any);
    /**
     * 当前路由是否全屏显示
     */
    isFullPage?: boolean;
    /**
     * meta
     */
    meta?: IMeta;
    children?: IRouter[];
}


// 文件path
type FilePath = string;

// 路由path 如果不传 就直接 文件Path当作路由path
type RoutePath = string | undefined | null;

// 设置根路由
type IsFirst = boolean;

// 项目路径别名
export type Project = '@project' | '@oak-general-business' | '@oak-frontend-base';


// [项目别名， 文件path，[嵌套路由顶层path]，设置根路由, 路由path]
export type Page<T> = [Project, FilePath, Array<T>?, IsFirst?, RoutePath?];
