import { RuntimeContext as GeneralRuntimeContext } from 'oak-general-business';

/**
 * 若业务逻辑需要更多的上下文之间的数据传递，可以放在这里
 */
export interface RuntimeContext extends GeneralRuntimeContext {}
