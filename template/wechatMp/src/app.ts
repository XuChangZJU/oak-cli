import './init';
export interface IAppOption {
    globalData: {};
}

App<IAppOption>({
    globalData: {
    },
    async onLaunch() {
        console.log('onLaunch');
    },

    onHide() {
        console.log('onHide');
    },
});
