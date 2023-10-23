import { useFeatures as useCommonFeatures } from '@oak-frontend-base/platforms/web';
import { AFD } from '@project/types/RuntimeCxt';

// react 独有
// 这里因为开发时要引用src，而AFD定义中引用lib，所以有编译的warning.  by Xc
export default function useFeatures() {
    // @ts-ignore
    return useCommonFeatures<AFD>()
};