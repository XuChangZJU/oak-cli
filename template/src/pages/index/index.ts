
export default OakPage({
    path: 'house:list',
    entity: 'house',
    projection: {
        id: 1,
        iState: 1,
        coordinate: 1,
        decorative: 1,
        orientation: 1,
        space: 1,
    },
    isList: true,
    formData: async function ({ data, features }) {
        const application = await features.application.getApplication();
        return {};
    },
    // filters: [],
    // sorters: [],
    methods: {  
    },
});
