import React from 'react';
import { Button, Row, Col, Form, Input, Space, Textarea } from 'tdesign-react';
import OakGallery from '@oak-general-business/components/extraFile/gallery';
import Style from './web.module.less';

const { FormItem } = Form;

export default function render(this: any) {
    const { t } = this;
    const { number, name, price, introduction, author } = this.state;
    return (
        <div className={Style.container}>
            <Row>
                <Col xs={12} sm={6}>
                    <Form colon={true}>
                        <FormItem label={t('book:attr.number')}>
                            <>
                                <Input
                                    onChange={(value) => {
                                        this.setUpdateData('number', value);
                                    }}
                                    value={number}
                                />
                            </>
                        </FormItem>
                        <FormItem label={t('book:attr.name')}>
                            <>
                                <Input
                                    onChange={(value) => {
                                        this.setUpdateData('name', value);
                                    }}
                                    value={name}
                                />
                            </>
                        </FormItem>
                        <FormItem label={t('book:attr.author')}>
                            <>
                                <Input
                                    onChange={(value) => {
                                        this.setUpdateData('author', value);
                                    }}
                                    value={author}
                                />
                            </>
                        </FormItem>
                        <FormItem label={t('book:attr.price')}>
                            <>
                                <Input
                                    type="number"
                                    onChange={(value) => {
                                        if (value) {
                                            this.setUpdateData(
                                                'price',
                                                Number(value) * 100
                                            );
                                        } else {
                                            this.setUpdateData('price', null);
                                        }
                                    }}
                                    value={
                                        price !== '' &&
                                        price !== undefined &&
                                        price !== null
                                            ? price / 100
                                            : ''
                                    }
                                    suffix="元"
                                />
                            </>
                        </FormItem>
                        <FormItem label={t('book:attr.introduction')}>
                            <>
                                <Textarea
                                    maxlength={500}
                                    autosize={{
                                        minRows: 4,
                                    }}
                                    onChange={(value) => {
                                        this.setUpdateData(
                                            'introduction',
                                            value
                                        );
                                        // this.setState({
                                        //     introduction2: value,
                                        // });
                                    }}
                                    value={introduction || ''}
                                    // value={this.state.introduction2}
                                />
                            </>
                        </FormItem>
                        <FormItem label={t('book:attr.files')}>
                            <>
                                <OakGallery
                                    oakPath="extraFile$entity"
                                    oakParent={this.state.oakFullpath}
                                    type="image"
                                    origin="qiniu"
                                    tag1="cover"
                                    entity="book"
                                    autoUpload={true}
                                ></OakGallery>
                            </>
                        </FormItem>

                        <FormItem style={{ marginLeft: 100 }}>
                            <Space>
                                <Button
                                    type="submit"
                                    theme="primary"
                                    onClick={() => {
                                        this.confirm();
                                    }}
                                >
                                    {t('submit')}
                                </Button>
                                <Button
                                    type="reset"
                                    theme="default"
                                    onClick={() => {
                                        this.reset();
                                    }}
                                >
                                    {t('reset')}
                                </Button>
                            </Space>
                        </FormItem>
                    </Form>
                </Col>
            </Row>
        </div>
    );
}