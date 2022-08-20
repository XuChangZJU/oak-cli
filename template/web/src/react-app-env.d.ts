/// <reference types="react-scripts" />

declare module '*.module.less' {
    const classes: {
        readonly [key: string]: string;
    };
    export default classes;
}

declare namespace JSX {
    interface IntrinsicAttributes {
        ['oak:path']?: string;
        ['oak:value']?: string;
        ['oak:attr']?: string;
    }
}
