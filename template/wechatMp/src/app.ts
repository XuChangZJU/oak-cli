import { OakPage, OakComponent } from './init'
export interface IAppOption {
    globalData: {};
}

App<IAppOption>({
    globalData: {
        OakPage,
        OakComponent,
    },
    async onLaunch() {
        console.log('onLaunch');
    },

    onHide() {
        console.log('onHide');
    },
});
