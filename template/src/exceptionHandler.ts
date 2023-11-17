import {
    OakTokenExpiredException,
    OakMobileUnsetException,
    OakUserInfoUncompletedException,
    OakUserInfoLoadingException,
} from 'oak-general-business';
import {
    OakException,
    OakUnloggedInException,
    OakUserUnpermittedException,
    OakAttrNotNullException,
    OakInputIllegalException,
} from 'oak-domain/lib/types/Exception';
import {
    ExampleException,
} from '@project/types/Exception';
import { FeatureDict } from '@project/features';
import { AFD } from '@project/types/RuntimeCxt';

/**
 * 构造backUrl
 * @param location
 * @param encode
 * @returns
 */

export const handler = async (reason: any, features: AFD) => {
    if (reason instanceof OakException) {
        if (reason instanceof OakUnloggedInException) {
            // await features.token.logout();
            features.navigator.navigateTo(
                {
                    url: '/login',
                },
                { isGoBack: true },
                true
            );
        } else if (reason instanceof OakTokenExpiredException) {
            await features.token.logout();
            features.navigator.navigateTo(
                {
                    url: '/login',
                },
                { isGoBack: true },
                true
            );
        } /* else if (reason instanceof OakUserUnpermittedException) {
            features.navigator.redirectTo(
                {
                    url: '/result/403',
                },
                undefined,
                true
            );
        } */ else if (reason instanceof OakMobileUnsetException) {
            features.navigator.navigateTo(
                {
                    url: '/mobile/me',
                },
                undefined,
                true
            );
        } else if (reason instanceof OakUserInfoUncompletedException) {
            const userId = features.token.getUserId();
            features.navigator.navigateTo(
                {
                    url: '/user/manager/upsert',
                    oakId: userId,
                },
                undefined,
                true
            );
        } else if (reason instanceof OakInputIllegalException) {
            features.message.setMessage({
                content: reason.message,
                type: 'error',
            });
        } else if (reason instanceof OakAttrNotNullException) {
            features.message.setMessage({
                content: reason.message,
                type: 'error',
            });
        } else if (reason instanceof OakUserInfoLoadingException) {
            // 暂不处理，在oak-general-business的page的生命周期里，等token加载完成了会刷新页面的
            console.warn(reason);
        } else if (reason instanceof ExampleException) {
            console.log('在此处理ExampleException');
        } else {
            console.warn(reason);
            features.message.setMessage({
                content: reason.message,
                type: 'error',
            });
        }
        return true;
    }
    console.error(reason);
    features.message.setMessage({
        content: reason.message,
        type: 'error',
    });
    return false;
};
