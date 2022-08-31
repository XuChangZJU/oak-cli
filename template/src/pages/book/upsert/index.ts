
export default OakPage({
    path: 'book:upsert',
    entity: 'book',
    projection: {
        id: 1,
        iState: 1,
        name: 1,
        number: 1,
        introduction: 1,
        price: 1,
        author: 1,
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
    formData: async function ({ data: book, features }) {
        return {
            id: book?.id,
            iState: book?.iState,
            name: book?.name,
            number: book?.number,
            introduction: book?.introduction,
            price: book?.price,
            author: book?.author,
            extraFile$entity: book?.extraFile$entity,
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
