import { composeFileUrl } from 'oak-general-business';
import { Schema as ExtraFile } from 'oak-app-domain/ExtraFile/Schema';

export default OakPage({
    path: 'store:upsert',
    entity: 'store',
    projection: {
        id: 1,
        iState: 1,
        name: 1,
        coordinate: 1,
        areaId: 1,
        addrDetail: 1,
        extraFile$entity: {
            $entity: 'extraFile',
            data: {
                id: 1,
                tag1: 1,
                origin: 1,
                bucket: 1,
                objectId: 1,
                filename: 1,
                extra1: 1,
                extension: 1,
                type: 1,
                entity: 1,
            },
            filter: {
                tag1: {
                    $in: ['cover'],
                },
            },
        },
    },
    isList: false,
    formData: async function ({ data: store, features }) {
        const application = await features.application.getApplication();
        const extraFile$entity = store?.extraFile$entity as Array<ExtraFile>;

        const coverPictures = extraFile$entity
            ?.filter((ele) => ['cover'].includes(ele.tag1))
            .map((ele) =>
                composeFileUrl(
                    ele as Pick<
                        ExtraFile,
                        | 'type'
                        | 'bucket'
                        | 'filename'
                        | 'origin'
                        | 'extra1'
                        | 'objectId'
                        | 'extension'
                        | 'entity'
                    >,
                    application?.system?.config
                )
            );

        return {
            iState: store?.iState,
            name: store?.name,
            coordinate: store?.coordinate,
            areaId: store?.areaId,
            addrDetail: store?.addrDetail,
            id: store?.id,
            coverPictures,
        };
    },
    methods: {
        async confirm() {
            await this.execute(this.props.oakId ? 'update' : 'create');
            if (this.props.oakFrom === 'book:list') {
                this.navigateBack();
                return;
            }
            this.navigateBack();
        },
        async reset() {
            // 重置
            this.resetUpdateData();
        },
    },
});
