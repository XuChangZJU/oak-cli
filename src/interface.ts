

/**
 * @name 生成package.json需要输入的参数
 * @export
 * @interface PackageJsonInput
 */
export interface PackageJsonInput {
    name: string;
    version?: string;
    description?: string;
    cliVersion: string;
    cliName: string;
    cliBinName: string;
    isDev?: boolean;
}

/**
 * @name Prompt需要输入的参数
 * @export
 * @interface PromptInput
 */
export interface PromptInput {
    name: string,
    version: string, 
    description: string, 
    title: string,
}

/**
 * @name project.config.json
 * @export
 * @interface ProjectConfigInterface
 */
export interface ProjectConfigInterface {
    packOptions: PackOptions
}
/**
 * @name project.config.json PackOptions
 * @export
 * @interface PackOptions
 */
export interface PackOptions {
    ignore: Array<PackOptionsIgnore>
}
/**
 * @name project.config.json PackOptions PackOptionsIgnore
 * @export
 * @interface PackOptionsIgnore
 */
export interface PackOptionsIgnore {
    type: string,
    value: string
}