
export default OakComponent({
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
    formData: function ({ data: store, features }) {
        return {
            iState: store?.iState,
            name: store?.name,
            coordinate: store?.coordinate,
            areaId: store?.areaId,
            addrDetail: store?.addrDetail,
            id: store?.id,
            extraFile$entity: store?.extraFile$entity,
        };
    },
    data: {
        visible: false,
    },
    methods: {
        async confirm() {
            await this.execute();
            this.navigateBack();
        },
        async reset() {
            // 重置
            this.clean();
        },
    },
});
