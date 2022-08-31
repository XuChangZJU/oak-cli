import { composeFileUrl } from 'oak-general-business';
import { OpSchema as ExtraFile } from 'oak-app-domain/ExtraFile/Schema';

export default OakPage({
    path: 'store:list',
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
    isList: true,
    formData: async function ({ data: stores, features }) {
        const application = await features.application.getApplication();
        const filter = await this.getFilterByName('name');
        const pagination = this.getPagination();

        return {
            stores: stores?.map((store, index: number) => {
                const extraFile$entity =
                    store?.extraFile$entity as Array<ExtraFile>;
                const coverPictures = extraFile$entity
                    ?.filter((ele: ExtraFile) => ['cover'].includes(ele.tag1))
                    .map((ele: ExtraFile) =>
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
                    index,
                    iState: store?.iState,
                    name: store?.name,
                    coordinate: store?.coordinate,
                    areaId: store?.areaId,
                    addrDetail: store?.addrDetail,
                    id: store?.id,
                    coverPicture: coverPictures?.[0],
                };
            }),
            pagination,
            searchValue: (filter?.name as { $includes: string })?.$includes,
        };
    },
    // filters: [],
    // sorters: [],
    methods: {
        goUpsert() {
            this.navigateTo({
                url: '/store/upsert',
            });
        },
        goUpsertById(id: string) {
            this.navigateTo({
                url: '/store/upsert',
                oakId: id,
            });
        },
        goDetailById(id: string) {
            this.navigateTo({
                url: '/store/detail',
                oakId: id,
            });
        },
        onRemove(path: string) {
            this.execute('remove', [], path);
        },
        async searchChange(event: any) {
            const { value } = this.resolveInput(event);
            this.searchValueChange(value);
        },
        async searchValueChange(value: string) {
            this.addNamedFilter({
                filter: {
                    name: {
                        $includes: value!,
                    },
                },
                '#name': 'name',
            });
        },
        async searchCancel() {
            this.removeNamedFilterByName('name');
        },
        async searchConfirm() {
            this.refresh();
        },
    },
});
