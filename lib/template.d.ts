import { PackageJsonInput } from './interface';
export declare function packageJsonContent({ name, version, description, cliversion, cliname, isDev, }: PackageJsonInput): string;
export declare function tsConfigJsonContent(): string;
export declare function projectConfigContentWithWeChatMp(oakConfigName: string, projectname: string, miniVersion: string): string;
export declare function appJsonContentWithWeChatMp(isDev: boolean): string;
export declare function oakConfigContentWithWeChatMp(): string;
