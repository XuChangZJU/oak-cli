Component({
    externalClasses: ['g-cell', 'g-cell-label', 'g-cell-content', 'g-cell-content-right', 'material-symbols-rounded'],
    methods: {
        // button点击事件
        onMenuTap(event: WechatMiniprogram.Touch) {
            const { index } = event.currentTarget.dataset;
            if (index === "1") {
                // todo
            }
            else {
                console.log(index);
            }
        },
    }
});
