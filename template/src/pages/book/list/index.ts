import { composeFileUrl } from 'oak-general-business';
import { OpSchema as ExtraFile } from 'oak-app-domain/ExtraFile/Schema';

export default OakPage({
    path: 'book:list',
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
    isList: true,
    formData: async function ({ data: books, features }) {
        const application = await features.application.getApplication();
        const filter = await this.getFilterByName('name');
        const pagination = this.getPagination();

        return {
            books: books?.map((book, index: number) => {
                const extraFile$entity =
                    book?.extraFile$entity as Array<ExtraFile>;
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
                    iState: book?.iState,
                    name: book?.name,
                    number: book?.number,
                    introduction: book?.introduction,
                    price: book?.price,
                    author: book?.author,
                    id: book?.id,
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
        goBookUpsert() {
            this.navigateTo({
                url: '/book/upsert',
            });
        },
        goBookUpsertById(id: string) {
            this.navigateTo({
                url: '/book/upsert',
                oakId: id,
            });
        },
        goBookDetailById(id: string) {
            this.navigateTo({
                url: '/book/detail',
                oakId: id,
            });
        },
        onRemoveBook(path: string) {
            this.execute('remove', ['remove'], path);
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
